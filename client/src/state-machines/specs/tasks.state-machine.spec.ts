﻿import { describe, it } from "vitest";
import {
  adds_22_tasks_and_then_refuses_subsequent_tasks,
  adds_a_task,
  adds_a_task_list,
  updates_a_task_list_name,
  lets_user_carry_tasks,
  lets_user_carry_tasks_maximum_twice,
  lets_user_remove_tasks,
  selects_a_different_tasks_list,
  selecting_a_tasks_list_resets_the_tasks,
  lets_user_tick_off_task,
  removes_ticked_tasks_when_all_tasks_are_carried
} from '@/state-machines/specs/tasks.state-machine.steps'

describe("Tasks state machine", () => {
  describe("Tasks lists", () => {
    it("adds a task list", adds_a_task_list);
    it("updates a task list name", updates_a_task_list_name);
    it("selects a different tasks list", selects_a_different_tasks_list);
  });
  describe("Tasks", () => {
    it("adds a task", adds_a_task);
    it("lets user tick off task", lets_user_tick_off_task);
    it("adds 22 tasks and then refuses subsequent tasks", adds_22_tasks_and_then_refuses_subsequent_tasks);
    it("lets user carry tasks", lets_user_carry_tasks);
    it('removes ticked tasks when all tasks are carried', removes_ticked_tasks_when_all_tasks_are_carried);
    it("lets user remove tasks", lets_user_remove_tasks);
    it("lets user carry tasks maximum twice", lets_user_carry_tasks_maximum_twice);
    it("selecting a tasks list resets the tasks", selecting_a_tasks_list_resets_the_tasks);
  });
});
