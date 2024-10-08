﻿import { assign, createMachine } from "xstate";
import type { Task, Tasks, TasksList } from '@/types/types'
import {
  canCarryTask,
  getNextTaskId, getNextTaskListId,
  tasksAreEmpty,
  tasksAreFull,
  tasksHaveBeenCarried
} from '@/state-machines/tasks.extensions'
import {
  TasksListMachineStates,
  TasksMachineStates,
} from "@/state-machines/tasks.states";

export const taskLimit = 22;

export const tasksMachine = createMachine(
  {
    types: {} as {
      context: { id: number; name: string; tasks: Tasks, tasksLists: TasksList[] };
    },
    context: { id: 0, name: "", tasks: [], tasksLists: [] as TasksList[]},
    on: {
      reset: {
        target: `.${TasksListMachineStates.empty}`,
        actions: assign({ id: 0, name: "", tasks: [], tasksLists: [] as TasksList[]})
      }
    },
    initial: TasksListMachineStates.empty,
    states: {
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
            actions: [
              assign({
                id: ({ context }) => (context.id = getNextTaskListId(context.tasksLists)),
                name: ({ context, event }) => (context.name = event.name),
                tasksLists: ({ context }) => context.tasksLists.concat({id: context.id, name: context.name,}),
              }),
            ],
            target: TasksListMachineStates.addingTasksLists,
          },
        },
      },
      addingTasksLists: {
        initial: TasksMachineStates.empty,
        on: {
          addTasksList: {
            actions: [
              assign({
                id: ({ context }) => (context.id = getNextTaskListId(context.tasksLists)),
                name: ({ context, event }) => (context.name = event.name),
                tasksLists: ({ context }) => context.tasksLists.concat({id: context.id, name: context.name,}),
              }),
            ],
          },
          updateTasksList: {
            actions: [
              assign({
                name: ({ context, event }) => (context.name = event.name),
                tasksLists: ({ context, event }) => context.tasksLists.map((list) => {
                  if (list.id === event.id) {
                    list.name = event.name;
                  }
                  return list;
                })
              }),
            ],
          },
          selectTasksList: {
            actions: assign({
              id: ({ context, event }) => {
                if (context.tasksLists.find((list) => list.id === event.id) === undefined) return context.id;
                return (context.id = event.id)
              },
              name: ({ context, event }) => {
                const name = context.tasksLists.find((list) => list.id === event.id)?.name;
                if (name === undefined) return context.name;
                return (context.name = name)
              },
              tasks: ({ context }) => (context.tasks = []),
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
              guard: "tasksAreEmpty",
              target: TasksMachineStates.addingTasks,
            },
          },
          addingTasks: {
            on: {
              add: {
                actions: assign({
                  tasks: ({ context, event }) =>
                    context.tasks.concat({id: getNextTaskId(context.tasks), content: event.content, carried: false, page: 0, ticked: false}),
                }),
              },
              tick: {
                actions: assign({
                  tasks: ({ context, event }) => {
                    const task = context.tasks.find((task) => task.id === event.id) ?? ({} as Task);
                    task.ticked = true;
                    return context.tasks;
                  },
                }),
              },
            },
            always: {
              guard: "tasksAreFull",
              target: TasksMachineStates.choosingTasksToCarry,
            },
          },
          choosingTasksToCarry: {
            on: {
              carry: {
                actions: assign({
                  tasks: ({ context, event }) => {
                    const task = context.tasks.find((task) => task.id === event.id) ?? ({} as Task);
                    if (canCarryTask(task)) {
                      task.page += 1;
                      task.carried = true;
                    }
                    return context.tasks;
                  },
                }),
              },
              remove: {
                actions: assign({
                  tasks: ({ context, event }) => {
                    context.tasks = context.tasks.filter((task) => task.id !== event.id,);
                    return context.tasks;
                  },
                }),
              },
            },
            always: {
              guard: "tasksHaveAllBeenCarried",
              target: TasksMachineStates.addingTasks,
            },
            exit: [
              (context) => {
                context.context.tasks = context.context.tasks.filter((task) => !task.ticked).map((task) => {
                  task.carried = false;
                  return task;
                });
              },
            ],
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
      tasksHaveAllBeenCarried: ({ context }) => {
        return tasksHaveBeenCarried(context);
      },
      tasksAreFull: ({ context }) => {
        return tasksAreFull(context);
      },
      tasksListsExist: ({ context }) => {
        return context.id !== 0;
      },
      tasksAreEmpty: ({ context }) => {
        return !tasksAreEmpty(context);
      },
    },
  },
);