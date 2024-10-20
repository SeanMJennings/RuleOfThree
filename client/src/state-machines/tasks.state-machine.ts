﻿import {assign, createMachine, fromPromise} from "xstate";
import type {Task, TasksList} from '@/types/types'
import {canCarryTask, tasksAreEmpty, tasksAreFull, tasksHaveBeenCarried} from '@/state-machines/tasks.extensions'
import {TasksListMachineStates, TasksMachineStates,} from "@/state-machines/tasks.states";
import {addTask, addTasksList, getTasksLists, removeTask, tickTask, updateTasksList} from "@/apis/tasks_list.api";

export const tasksMachine = createMachine(
    {
        types: {} as {
            context: { id: string; tasksLists: TasksList[] };
        },
        context: {id: '', tasksLists: [] as TasksList[]},
        on: {
            reset: {
                target: `.${TasksListMachineStates.empty}`,
                actions: assign({
                    id: ({context}) => (context.id = ''),
                    tasksLists: ({context}) => context.tasksLists = [] as TasksList[],
                }),
            }
        },
        initial: TasksListMachineStates.empty,
        states: {
            empty: {
                invoke: {
                    src: fromPromise(async () => await getTasksLists()),
                    onDone: {
                        actions: assign({
                            id: ({context, event}) => (context.id = event.output.length > 0 ? event.output[0].id : ''),
                            tasksLists: ({context, event}) => event.output.length > 0 ? context.tasksLists = event.output : context.tasksLists,
                        }),
                    },
                },
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
                            tasksLists: ({context, event}) => context.tasksLists.concat({
                                id: event.output.id,
                                name: event.output.name,
                                tasks: [],
                            }),
                        }),
                    },
                },
            },
            updatingTheTasksList: {
                invoke: {
                    input: ({event}) => ({id: event.id, name: event.name}),
                    src: fromPromise(async ({input: {id, name}}) => await updateTasksList(id, name)),
                    onDone: {
                        target: TasksListMachineStates.addingTasksLists,
                        actions: assign({
                            tasksLists: ({context, event}) => context.tasksLists.map((list) => {
                                if (list.id === event.output.id) {
                                    list.name = event.output.name;
                                }
                                return list;
                            })
                        }),
                    },
                },
            },
            addingTasksLists: {
                initial: TasksMachineStates.empty,
                on: {
                    addTasksList: {
                        target: TasksListMachineStates.creatingTheTasksList,
                    },
                    updateTasksList: {
                        target: TasksListMachineStates.updatingTheTasksList,
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
                    empty: {
                        on: {
                            readyToAddFirstTask: {
                                target: TasksMachineStates.addingTasks,
                            },
                        },
                        always: {
                            guard: "tasksAreNotEmpty",
                            target: TasksMachineStates.addingTasks,
                        },
                    },
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
                                actions: assign({
                                    tasksLists: ({context, event}) => context.tasksLists.map((list) => {
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
                                    })
                                })
                            },
                        },
                    },
                    tickingTheTask: {
                        invoke: {
                            input: ({ context, event}) => ({id: context.id, taskId: event.id}),
                            src: fromPromise(async ({input: {id, taskId}}) => await tickTask(id, taskId)),
                            onDone: {
                                target: TasksMachineStates.addingTasks,
                                actions: assign({
                                    tasksLists: ({context, event}) => context.tasksLists.map((list) => {
                                        if (list.id === context.id) {
                                            const task = context.tasksLists.find((tasksList) => tasksList.id === context.id)?.tasks.find((task) => task.id === event.output.taskId) ?? ({} as Task);
                                            task.ticked = true;
                                        }
                                        return list;
                                    })
                                })
                            },
                        },
                    },
                    choosingTasksToCarry: {
                        on: {
                            carry: {
                                actions: assign({
                                    tasksLists: ({context, event}) => context.tasksLists.map((list) => {
                                        if (list.id === context.id) {
                                            const task = context.tasksLists.find((tasksList) => tasksList.id === context.id)?.tasks.find((task) => task.id === event.id) ?? ({} as Task);
                                            if (canCarryTask(task)) {
                                                task.page += 1;
                                                task.carried = true;
                                            }
                                        }
                                        return list;
                                    })
                                }),
                            },
                            remove: {
                                target: TasksMachineStates.removingTheTask,
                            },
                        },
                        always: {
                            guard: "tasksHaveAllBeenCarried",
                            target: TasksMachineStates.addingTasks,
                        },
                        exit: [
                            (context) => {
                                context.context.tasksLists.map((list) => {
                                    if (list.id === context.context.id) {
                                        list.tasks = list.tasks.filter((task) => !task.ticked && !task.removed).map((task) => {
                                            task.carried = false;
                                            return task;
                                        });
                                    }
                                    return list;
                                })
                            },
                        ],
                    },
                    removingTheTask: {
                        invoke: {
                            input: ({context, event}) => ({id: context.id, taskId: event.id}),
                            src: fromPromise(async ({input: {id, taskId}}) => await removeTask(id, taskId)),
                            onDone: {
                                target: TasksMachineStates.choosingTasksToCarry,
                                actions: assign({
                                    tasksLists: ({context, event}) => context.tasksLists.map((list) => {
                                        if (list.id === context.id) {
                                            const task = context.tasksLists.find((tasksList) => tasksList.id === context.id)?.tasks.find((task) => task.id === event.output.taskId) ?? ({} as Task);
                                            task.removed = true;
                                        }
                                        return list;
                                    })
                                })
                            },
                        },
                    },
                },
            },
            assessingTasksList: {
                always: {
                    target: TasksListMachineStates.addingTasksLists,
                },
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
                return context.id !== "";
            },
            tasksAreNotEmpty: ({context}) => {
                return !tasksAreEmpty(context);
            },
        },
    },
);