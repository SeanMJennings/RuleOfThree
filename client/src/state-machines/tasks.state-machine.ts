﻿import {type AnyEventObject, assign, createMachine, emit, fromPromise} from "xstate";
import type {Task, TasksList} from '@/types/types'
import {
    tasksAreFull,
    tasksAreReadyForNewPage,
    tasksHaveBeenCarried,
} from '@/state-machines/tasks.extensions'
import {TasksListMachineStates, TasksMachineStates,} from "@/state-machines/tasks.states";
import {
    addTask,
    addTasksList,
    carryTask,
    deleteTasksList,
    getTasksLists,
    removeTask,
    tickTask,
    updateTasksList
} from "@/apis/tasks_list.api";
import type {HttpError} from "@/common/http";

export type TasksMachineContext = {
    id: string;
    tasksLists: TasksList[];
};

export type TasksMachineError = {
    type: string;
    error: string;
};

type TasksMachineNestedContext = {
    context: TasksMachineContext;
};

type TasksMachineContextAndEvent = {context: TasksMachineContext, event: AnyEventObject};

const assessingTasksExit = (context: TasksMachineNestedContext)=> {
    context.context.tasksLists.map((list) => {
        if (list.id === context.context.id && tasksAreReadyForNewPage(list)) {
            list.tasks = list.tasks.filter((task) => !task.ticked && !task.removed && (task.page <= 1 || (task.page == 2 && task.carried))).map((task) => {
                task.carried = false;
                return task;
            });
        }
        return list;
    });
}

export const tasksMachine = createMachine(
    {
        types: {} as {
            context: TasksMachineContext;
        },
        context: {id: '', tasksLists: [] as TasksList[]},
        initial: TasksListMachineStates.loading,
        on: {
            reset: {
                target: `.${TasksListMachineStates.loading}`,
                actions: assign({
                    id: ({context}) => (context.id = ''),
                    tasksLists: ({context}) => context.tasksLists = [] as TasksList[],
                }),
            }
        },
        states: {
            loading: {
                invoke: {
                    src: fromPromise(async () => await getTasksLists()),
                    onDone: {
                        target: TasksListMachineStates.empty,
                        actions: assign({
                            id: ({context, event}) => (context.id = event.output.length > 0 ? event.output[0].id : ''),
                            tasksLists: ({context, event}) => event.output.length > 0 ? context.tasksLists = event.output : context.tasksLists,
                        }),
                    },
                    onError: {
                        target: TasksListMachineStates.empty,
                        actions: emit(({ event }) => { return { type: 'error', error: (event.error as HttpError).error }})
                    }
                },
            },
            empty: {
                on: {
                    readyToAddFirstTaskList: {
                        target: TasksListMachineStates.readyToAddTasksLists,
                    },
                },
                always: {
                    guard: "tasksListsExist",
                    target: TasksListMachineStates.addingTasksLists,
                },
            },
            readyToAddTasksLists: {
                on: {
                    addTasksList: {
                        target: TasksListMachineStates.creatingTheTasksList,
                    },
                },
            },
            creatingTheTasksList: {
                invoke: {
                    input: ({event}) => ({name: event.name}),
                    src: fromPromise(async ({input: {name}}) => await addTasksList(name)),
                    onDone: {
                        target: TasksListMachineStates.addingTasksLists,
                        actions: assign({
                            id: ({context, event}) => (context.id = event.output.id),
                            tasksLists: taskList(),
                        }),
                    },
                    onError: {
                        target: TasksListMachineStates.addingTasksLists,
                        actions: emit(({ event }) => { return { type: 'error', error: (event.error as HttpError).error }})
                    }
                },
            },
            updatingTheTasksList: {
                invoke: {
                    input: ({event}) => ({id: event.id, name: event.name}),
                    src: fromPromise(async ({input: {id, name}}) => await updateTasksList(id, name)),
                    onDone: {
                        target: TasksListMachineStates.addingTasksLists,
                        actions: assign({ tasksLists: taskListWithUpdatedName() }),
                    },
                    onError: {
                        target: TasksListMachineStates.addingTasksLists,
                        actions: emit(({ event }) => { return { type: 'error', error: (event.error as HttpError).error }})
                    }
                },
            },
            deletingTheTasksList: {
                invoke: {
                    input: ({context}) => ({id: context.id}),
                    src: fromPromise(async ({input: {id}}) => await deleteTasksList(id)),
                    onDone: {
                        target: TasksListMachineStates.empty,
                        actions: assign({ 
                            id: ({context, event }) => (context.id = context.tasksLists.length > 1 ? context.tasksLists.filter((list) => list.id !== event.output.id)[0]?.id : ''),
                            tasksLists: ({context, event}) => context.tasksLists.filter((list) => list.id !== event.output.id),
                        }),
                    },
                    onError: {
                        target: TasksListMachineStates.empty,
                        actions: emit(({ event }) => { return { type: 'error', error: (event.error as HttpError).error }})
                    }
                },
            },
            addingTasksLists: {
                initial: TasksMachineStates.addingTasks,
                on: {
                    addTasksList: {
                        target: TasksListMachineStates.creatingTheTasksList,
                    },
                    updateTasksList: {
                        target: TasksListMachineStates.updatingTheTasksList,
                    },
                    deleteTasksList: {
                        target: TasksListMachineStates.deletingTheTasksList,
                    },
                    selectTasksList: {
                        actions: assign({
                            id: ({context, event}) => {
                                if (context.tasksLists.find((list) => list.id === event.id) === undefined) return context.id;
                                return (context.id = event.id)
                            }
                        }),
                        target: TasksListMachineStates.assessingTasksList,
                    },
                },
                states: {
                    addingTasks: {
                        on: {
                            add: {
                                target: TasksMachineStates.creatingTheTask,
                            },
                            tick: {
                                target: TasksMachineStates.tickingTheTask,
                            },
                        },
                        always: {
                            guard: "tasksAreFull",
                            target: TasksMachineStates.choosingTasksToCarry,
                        },
                    },
                    creatingTheTask: {
                        invoke: {
                            input: ({ context, event}) => ({id: context.id, content: event.content}),
                            src: fromPromise(async ({input: {id, content}}) => await addTask(id, content)),
                            onDone: {
                                target: TasksMachineStates.addingTasks,
                                actions: assign({ tasksLists: taskListWithCreatedTask() })
                            },
                            onError: {
                                target: TasksMachineStates.addingTasks,
                                actions: emit(({ event }) => { return { type: 'error', error: (event.error as HttpError).error }})
                            }
                        },
                    },
                    tickingTheTask: {
                        invoke: {
                            input: ({ context, event}) => ({id: context.id, taskId: event.id}),
                            src: fromPromise(async ({input: {id, taskId}}) => await tickTask(id, taskId)),
                            onDone: {
                                target: TasksMachineStates.addingTasks,
                                actions: assign({ tasksLists: taskListWithTickedTask() })
                            },
                            onError: {
                                target: TasksMachineStates.addingTasks,
                                actions: emit(({ event }) => { return { type: 'error', error: (event.error as HttpError).error }})
                            }
                        },
                    },
                    choosingTasksToCarry: {
                        on: {
                            carry: {
                                target: TasksMachineStates.carryingTheTask,
                            },
                            remove: {
                                target: TasksMachineStates.removingTheTask,
                            },
                        },
                        always: {
                            guard: "tasksHaveAllBeenCarried",
                            target: TasksMachineStates.addingTasks,
                        },
                    },
                    removingTheTask: {
                        invoke: {
                            input: ({context, event}) => ({id: context.id, taskId: event.id}),
                            src: fromPromise(async ({input: {id, taskId}}) => await removeTask(id, taskId)),
                            onDone: {
                                target: TasksMachineStates.assessingTasks,
                                actions: assign({ tasksLists: taskListWithRemovedTask()})
                            },
                            onError: {
                                target: TasksMachineStates.addingTasks,
                                actions: emit(({ event }) => { return { type: 'error', error: (event.error as HttpError).error }})
                            }
                        }
                    },
                    carryingTheTask: {
                        invoke: {
                            input: ({context, event}) => ({id: context.id, taskId: event.id}),
                            src: fromPromise(async ({input: {id, taskId}}) => await carryTask(id, taskId)),
                            onDone: {
                                target: TasksMachineStates.assessingTasks,
                                actions: assign({ tasksLists: taskListWithCarriedTask()})
                            },
                            onError: {
                                target: TasksMachineStates.addingTasks,
                                actions: emit(({ event }) => { return { type: 'error', error: (event.error as HttpError).error }})
                            }
                        },
                    },
                    assessingTasks: {
                        always: {
                            target: TasksMachineStates.addingTasks,
                        },
                        exit: [assessingTasksExit],
                    },
                },
            },
            assessingTasksList: {
                always: {
                    target: TasksListMachineStates.addingTasksLists,
                }
            },
            success: {
                always: {
                    target: TasksListMachineStates.addingTasksLists
                },
            },
        },
    },
    {
        guards: {
            tasksHaveAllBeenCarried: ({context}) => {
                return tasksHaveBeenCarried(context);
            },
            tasksAreFull: ({context}) => {
                return tasksAreFull(context);
            },
            tasksListsExist: ({context}) => {
                return context.tasksLists.length > 0;
            }
        },
    },
);

function taskList() {
    return ({ context, event }: TasksMachineContextAndEvent) => context.tasksLists.concat({
        id: event.output.id,
        name: event.output.name,
        tasks: [],
    });
}

function taskListWithUpdatedName() {
    return ({ context, event }: TasksMachineContextAndEvent) => context.tasksLists.map((list) => {
        if (list.id === event.output.id) {
            list.name = event.output.name;
        }
        return list;
    });
}

function taskListWithRemovedTask() {
    return ({ context, event }: TasksMachineContextAndEvent) => context.tasksLists.map((list) => {
        if (list.id === context.id) {
            const task = context.tasksLists.find((tasksList) => tasksList.id === context.id)?.tasks.find((task) => task.id === event.output.taskId) ?? ({} as Task);
            task.removed = true;
        }
        return list;
    });
}

function taskListWithTickedTask() {
    return ({ context, event }: TasksMachineContextAndEvent) => context.tasksLists.map((list) => {
        if (list.id === context.id) {
            const task = context.tasksLists.find((tasksList) => tasksList.id === context.id)?.tasks.find((task) => task.id === event.output.taskId) ?? ({} as Task);
            task.ticked = true;
        }
        return list;
    });
}

function taskListWithCreatedTask() {
    return ({ context, event }: TasksMachineContextAndEvent) => context.tasksLists.map((list) => {
        if (list.id === context.id) {
            list.tasks.push({
                id: event.output.id,
                content: event.output.content,
                carried: false,
                removed: false,
                page: 0,
                ticked: false
            });
        }
        return list;
    });
}

function taskListWithCarriedTask() {
    return ({ context, event } : {context: TasksMachineContext, event: AnyEventObject}) => context.tasksLists.map((list) => {
        if (list.id === context.id) {
            const task = context.tasksLists.find((tasksList) => tasksList.id === context.id)?.tasks.find((task) => task.id === event.output.taskId && task.page <= 1) ?? ({} as Task);
            task.carried = true;
            task.page += 1;
        }
        return list;
    });
}
