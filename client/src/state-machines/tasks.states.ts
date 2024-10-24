﻿export const enum TasksListMachineStates {
    loading = "loading",
    empty = "empty",
    readyToAddTasksLists = "readyToAddTasksLists",
    creatingTheTasksList = "creatingTheTasksList",
    updatingTheTasksList = "updatingTheTasksList",
    deletingTheTasksList = "deletingTheTasksList",
    addingTasksLists = "addingTasksLists",
    assessingTasksList = "assessingTasksList",
}

export const enum TasksMachineStates {
    addingTasks = "addingTasks",
    creatingTheTask = "creatingTheTask",
    tickingTheTask = "tickingTheTask",
    removingTheTask = "removingTheTask",
    carryingTheTask = "carryingTheTask",
    choosingTasksToCarry = "choosingTasksToCarry",
    assessingTasks = "assessingTasks",
}

export const TasksMachineCombinedStates = {
    empty: TasksListMachineStates.empty,
    readyToAddTasksLists: TasksListMachineStates.readyToAddTasksLists,
    addingTasksListsCreatingTheTask: {addingTasksLists: TasksMachineStates.creatingTheTask},
    addingTasksListTickingTheTask: {addingTasksLists: TasksMachineStates.tickingTheTask},
    addingTasksListsAddingTasks: {addingTasksLists: TasksMachineStates.addingTasks,},
    addingTasksListsChoosingTasksToCarry: {addingTasksLists: TasksMachineStates.choosingTasksToCarry,},
    addingTasksListsCarryingTheTask: {addingTasksLists: TasksMachineStates.carryingTheTask,},
    addingTasksListsRemovingTheTask: {addingTasksLists: TasksMachineStates.removingTheTask,},
    addingTasksListsAssessingTasks: {addingTasksLists: TasksMachineStates.assessingTasks,},
};
