﻿from tests.specification import *
from tests.domain.tasks_list_steps import *


def test_create_empty_tasks_list():
    Given(a_tasks_list_name)
    When(creating_a_tasks_list)
    Then(the_tasks_list_is_empty)


def test_can_add_task_to_tasks_list():
    Given(a_tasks_list_name)
    And(creating_a_tasks_list)
    When(adding_a_task_to_tasks_list("My Task"))
    Then(the_tasks_list_contains_a_task_with_text("My Task"))


def test_can_tick_a_task():
    Given(a_tasks_list)
    And(adding_a_task_to_tasks_list("My Task"))
    When(ticking_a_task)
    Then(the_task_is_ticked)


def test_cannot_tick_a_task_that_does_not_exist():
    Given(a_tasks_list)
    When(validating(ticking_a_task))
    Then(informs("Task not found"))


def test_have_to_decide_to_carry_or_remove_each_task_once_list_is_full():
    Given(a_tasks_list_with_22_tasks)
    When(validating(adding_a_task_to_tasks_list, "My Task"))
    Then(informs("Tasks list holds 22 tasks. Each task must be carried or removed"))


def test_cannot_carry_a_task_until_list_is_full():
    Given(a_tasks_list_with_20_tasks)
    When(validating(carrying_the_first_task))
    Then(informs("Tasks list is not yet full"))


def test_cannot_remove_a_task_until_list_is_full():
    Given(a_tasks_list_with_20_tasks)
    When(validating(removing_the_first_task))
    Then(informs("Tasks list is not yet full"))


def test_can_carry_task_once_list_is_full():
    Given(a_tasks_list_with_22_tasks)
    When(carrying_the_first_task)
    Then(the_first_task_is_carried)


def test_can_remove_a_task_once_list_is_full():
    Given(a_tasks_list_with_22_tasks)
    When(removing_the_first_task)
    Then(the_first_task_is_marked_for_removal)


def test_can_carry_some_tasks_and_remove_others():
    Given(a_tasks_list_with_22_tasks)
    When(carrying_the_first_eleven_tasks)
    And(removing_the_next_eleven_tasks)
    Then(the_first_eleven_tasks_are_carried)
    And(the_first_eleven_tasks_have_a_page_count_of_1)
    And(the_next_eleven_tasks_are_removed)


def test_ticked_tasks_cannot_be_marked_for_carrying():
    Given(a_tasks_list_with_20_tasks)
    And(ticking_the_first_task)
    And(adding_two_tasks)
    When(validating(carrying_the_first_task))
    Then(informs("Ticked tasks cannot be carried"))


def test_ticked_tasks_cannot_be_marked_for_removal():
    Given(a_tasks_list_with_20_tasks)
    And(ticking_the_first_task)
    And(adding_two_tasks)
    When(validating(removing_the_first_task))
    Then(informs("Ticked tasks cannot be marked for removal"))


def test_ticked_tasks_are_removed_when_a_list_is_carried():
    Given(a_tasks_list_with_20_tasks)
    And(ticking_the_first_task)
    And(adding_two_tasks)
    When(carrying_all_tasks_except_the_ticked_one)
    Then(the_ticked_task_is_removed)


def test_cannot_add_task_until_finished_carrying_or_removing_tasks():
    Given(a_tasks_list_with_22_tasks)
    When(carrying_the_first_eleven_tasks)
    When(validating(adding_a_task_to_tasks_list, "My Task"))
    Then(informs("Tasks list holds 22 tasks. Each task must be carried or removed"))


def test_can_only_carry_tasks_twice():
    Given(a_tasks_list_with_22_tasks)
    And(tasks_have_been_carried_twice)
    When(validating(carrying_the_first_task))
    Then(informs("Task has been carried twice and must be removed"))


def test_must_remove_task_that_has_been_carried_twice():
    Given(a_tasks_list_with_22_tasks)
    And(tasks_have_been_carried_twice)
    When(removing_all_tasks)
    Then(the_tasks_list_is_empty)
