﻿export type Id = { id: string };
export type TasksList = Id & {
    name: string;
    tasks: Tasks;
};
export type Tasks = Task[];
export type Task = Id & {
    content: string;
    ticked: boolean;
    carried: boolean;
    page: number;
};
