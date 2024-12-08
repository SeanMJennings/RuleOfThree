﻿import type {Task, TasksList} from '@/types/types'
import type {StateValue} from "xstate";
import {TasksListMachineStates, TasksMachineCombinedStates} from "@/state-machines/tasks.states";
import * as _ from "lodash";

type context = { id: string, tasksLists: TasksList[]; }
export const taskLimit = Number(import.meta.env.TASK_LIMIT || 22);
export const isOwner = (email: string | undefined, context: context) => selectedTaskListOwner(context) === email;

export const loading = (value: StateValue) => {
    return value === TasksListMachineStates.loading 
        || value === TasksListMachineStates.addingTasksLists
        || value === TasksListMachineStates.creatingTheTasksList
        || value === TasksListMachineStates.selectingTheTasksList
        || value === TasksListMachineStates.sharingTheTasksList
        || value === TasksListMachineStates.unsharingTheTasksList
        || value === TasksListMachineStates.unsharingTheTasksListForSelf
        || value === TasksListMachineStates.updatingTheTasksList
        || value === TasksListMachineStates.deletingTheTasksList
        || _.isEqual(value, TasksMachineCombinedStates.addingTasksListTickingTheTask)
        || _.isEqual(value, TasksMachineCombinedStates.addingTasksListsCreatingTheTask)
        || _.isEqual(value, TasksMachineCombinedStates.addingTasksListsTickingTheTaskDuringChoosing)
        || _.isEqual(value, TasksMachineCombinedStates.addingTasksListsRemovingTheTask)
        || _.isEqual(value, TasksMachineCombinedStates.addingTasksListsCarryingTheTask)
}

export const readyToAddTasks = (value: StateValue) => {
    return (value !== TasksMachineCombinedStates.empty && value !== TasksMachineCombinedStates.readyToAddTasksLists);
};

export const showCreateTasksList = (value: StateValue) => {
    return value === TasksMachineCombinedStates.empty;
}

export const notEmptyOrInitiallyLoading = (value: StateValue) => {
    return value !== TasksMachineCombinedStates.empty && value !== TasksListMachineStates.loading;
}

export const showAddTask = (value: StateValue) => {
    return _.isEqual(value, TasksMachineCombinedStates.addingTasksListsAddingTasks)
        || _.isEqual(value, TasksMachineCombinedStates.addingTasksListTickingTheTask)
        || _.isEqual(value, TasksMachineCombinedStates.addingTasksListsCreatingTheTask);
}

export const showTickTasks = (value: StateValue) => {
    return _.isEqual(value, TasksMachineCombinedStates.addingTasksListsAddingTasks) 
        || _.isEqual(value, TasksMachineCombinedStates.addingTasksListTickingTheTask)
        || _.isEqual(value, TasksMachineCombinedStates.addingTasksListsCreatingTheTask)
        || carryingOrRemovingTasks(value);
};

export const carryingOrRemovingTasks = (value: StateValue) => {
    return _.isEqual(value, TasksMachineCombinedStates.addingTasksListsChoosingTasksToCarry) 
        || _.isEqual(value, TasksMachineCombinedStates.addingTasksListsCarryingTheTask) 
        || _.isEqual(value, TasksMachineCombinedStates.addingTasksListsRemovingTheTask)
        || _.isEqual(value, TasksMachineCombinedStates.addingTasksListsAssessingTasks)
        || _.isEqual(value, TasksMachineCombinedStates.addingTasksListsTickingTheTaskDuringChoosing);
}

export const tasksAreFull = function (context: context) {
    const numberOfTasks = context.tasksLists.find((list) => list.id === context.id)?.tasks?.length;
    if (numberOfTasks === undefined) {
        return false;
    }
    return numberOfTasks >= taskLimit;
};

export const selectedTaskListName = function (context: context) {
    return context.tasksLists.find((list) => list.id === context.id)?.name;
}

export const selectedTaskListOwner = function (context: context) {
    return context.tasksLists.find((list) => list.id === context.id)?.ownerEmail;
}

export const tasksListNamingIsUpdating = function (value: StateValue) {
    return value === TasksListMachineStates.updatingTheTasksList;
}

export const tasksListSharerIsUpdating = function (value: StateValue) {
    return value === TasksListMachineStates.sharingTheTasksList 
        || value === TasksListMachineStates.unsharingTheTasksList 
        || value === TasksListMachineStates.unsharingTheTasksListForSelf;
}

export const tasksListIsBeingDeleted = function (value: StateValue) {
    return value === TasksListMachineStates.deletingTheTasksList;
}
    
export const tasksHaveBeenCarried = function (context: context): boolean {
    return context.tasksLists.find((list) => list.id === context.id)?.tasks.filter((n) => !n.carried && !n.ticked && !n.removed).length === 0;
};

export const tasksAreReadyForNewPage = function (tasksList: TasksList): boolean {
    return tasksList.tasks.filter((n) => n.carried || n.ticked || n.removed).length === taskLimit;
}

export const canCarryTask = function (task: Task): boolean {
    return task.page <= 1 && !task.ticked && !task.removed && !task.carried;
};

export const canRemoveTask = function (task: Task): boolean {
    return !task.carried && !task.ticked && !task.removed
}

export const getTasks = function (context: context): Task[] {
    return context.tasksLists.find((list) => list.id === context.id)?.tasks ?? [];
};

export const getSharers = function (context: context): string[] {
    return context.tasksLists.find((list) => list.id === context.id)?.sharedWith ?? [];
}

export const getName = function (context: context): string {
    return context.tasksLists.find((list) => list.id === context.id)?.name ?? '';
}

export const sharerExists = function (context: context, email: string): boolean {
    return context.tasksLists.find((list) => list.id === context.id)?.sharedWith.includes(email.toLowerCase()) ?? false;
}
