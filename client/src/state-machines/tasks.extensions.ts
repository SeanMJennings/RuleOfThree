﻿import type {Task, Tasks} from '@/types/types'
import type {StateValue} from "xstate";
import {TasksMachineCombinedStates} from "@/state-machines/tasks.states";
import {taskLimit} from "@/state-machines/tasks.state-machine";

export const ReadyToAddTasks = (value: StateValue) => {
    return (value !== TasksMachineCombinedStates.empty && value !== TasksMachineCombinedStates.readyToAddTasksLists);
};

export const tasksAreFull = function (context: { tasks: Tasks }) {
    return context.tasks.length >= taskLimit;
};

export const tasksAreEmpty = function (context: { tasks: Tasks }) {
    return context.tasks.length === 0;
};

export const tasksHaveBeenCarried = function (context: { tasks: Tasks; }): boolean {
    return context.tasks.filter((n) => !n.carried && !n.ticked).length === 0;
};

export const canCarryTask = function (task: Task): boolean {
    return task.page <= 1 && !task.ticked;
};
