﻿import {describe, it} from "vitest";
import {
    adds_and_lists_a_task,
    asks_user_to_create_first_task_list,
    character_count_limit_hidden_when_input_is_empty,
    disables_add_task_button_when_input_is_empty,
    displays_character_count_limit,
    displays_list_character_count_limit,
    displays_page_number_of_tasks,
    does_not_show_remove_or_carry_for_ticked_tasks,
    lets_user_add_a_task_list,
    lets_user_carry_tasks,
    lets_user_collapse_tasks_list_input,
    lets_user_collapse_tasks_list_single_select,
    lets_user_expand_tasks_list_input,
    lets_user_expand_tasks_list_single_select,
    lets_user_remove_tasks,
    lets_user_tick_tasks,
    limits_task_length_to_150_characters,
    list_character_count_limit_hidden_when_input_is_empty,
    only_shows_remove_tasks_for_tasks_carried_twice,
    removes_add_first_task_placeholder_on_click,
    renders_tasks,
    selects_first_of_multiple_lists,
    shows_task_count_if_there_are_tasks,
    shows_task_list_single_select_when_there_are_two_lists
} from '@/views/specs/Tasks.steps'

describe("Tasks", () => {
    describe("Task List", () => {
        it("asks user to create first task list", asks_user_to_create_first_task_list);
        it("lets user add a task list", lets_user_add_a_task_list);
        it("displays list character count limit", displays_list_character_count_limit);
        it("list character count limit hidden when input is empty", list_character_count_limit_hidden_when_input_is_empty);
        it('lets user collapse tasks list input', lets_user_collapse_tasks_list_input);
        it('lets user expand tasks list input', lets_user_expand_tasks_list_input);
        it("shows task list single select when there are two lists", shows_task_list_single_select_when_there_are_two_lists);
        it('lets user collapse tasks list single select', lets_user_collapse_tasks_list_single_select);
        it('lets user expand tasks list single select', lets_user_expand_tasks_list_single_select);
        it('selects first of multiple lists', selects_first_of_multiple_lists);
    });
    describe("Tasks", () => {
        it("renders tasks", renders_tasks);
        it("removes add first task placeholder on click", removes_add_first_task_placeholder_on_click);
        it("disables add task button when input is empty", disables_add_task_button_when_input_is_empty);
        it("adds and lists a task", adds_and_lists_a_task);
        it("shows task count if there are tasks", shows_task_count_if_there_are_tasks);
        it("limits task length to 150 characters", limits_task_length_to_150_characters);
        it("displays character count limit", displays_character_count_limit);
        it("character count limit hidden when input is empty", character_count_limit_hidden_when_input_is_empty);
        it("lets user tick tasks", lets_user_tick_tasks);
        it("lets user carry tasks", lets_user_carry_tasks);
        it("lets user remove tasks", lets_user_remove_tasks);
        it("displays page number of tasks", displays_page_number_of_tasks);
        it("does not show remove or carry for ticked tasks", does_not_show_remove_or_carry_for_ticked_tasks);
        it("only shows remove tasks for tasks carried twice", only_shows_remove_tasks_for_tasks_carried_twice);
    });
});
