﻿import { mount, VueWrapper } from "@vue/test-utils";
import Tasks from "../Tasks.vue";
import { useMachine } from '@xstate/vue'
import { tasksMachine } from '@/state-machines/tasks.state-machine'

let page: VueWrapper;
const { snapshot, send, actorRef } = useMachine(tasksMachine);
actorRef.start();

export function renderTasksView() {
  page = mountTasksView();
}

export function unmountTasksView() {
  page.unmount();
  send({ type: "reset" });
}

export function stopActor() {
  actorRef.stop();
}

export function pageText() {
  return page.text();
}

export function clickAddTaskListPlaceholder() {
  return elements.addTaskListPlaceholder.trigger("click");
}

export function clickTasksListCaret() {
  return elements.tasksListCaret.trigger("click");
}

export function clickTasksListSingleSelectCaret() {
  return elements.tasksListSelectCaret.trigger("click");
}

export function typeTaskListName(value: string) {
  return elements.addTaskListInput.setValue(value);
}

export function taskListNameInputText() {
  return (elements.addTaskListInput.element as HTMLInputElement).value;
}

export function taskListSingleSelectHidden() {
  return !elements.queryTaskListSingleSelect().exists();
}

export function taskListSingleSelectChosenValue() {
  return elements.taskListSingleSelect.value;
}

export function addTaskListSubmit() {
  return elements.addTaskListSubmit.trigger("click");
}

export async function clickAddFirstTask() {
  await elements.addFirstTask.trigger("click");
}

export async function addATaskList() {
  await clickAddTaskListPlaceholder();
  await typeTaskListName("Test Task List");
  await addTaskListSubmit();
}

export async function toggleTasksListInput() {
  await clickTasksListCaret();
}

export async function toggleTasksListSingleSelect() {
  await clickTasksListSingleSelectCaret();
}

export async function addAnotherTaskList() {
  await typeTaskListName("Test Task List 2");
  await addTaskListSubmit();
}

export function tasksListInputCollapsed() {
  return !elements.addTaskListInput.exists();
}

export function tasksListSingleSelectCollapsed() {
  return !elements.queryTaskListSingleSelect().exists();
}

export function tasksListSingleSelectCaretPointsDown() {
  return !elements.tasksListSelectCaret.classes().includes("fa-rotate-180");
}

export function tasksListInputCaretPointsDown() {
  return !elements.tasksListCaret.classes().includes("fa-rotate-180");
}

export function tasksListInputCaretPointsUp() {
  return !tasksListInputCaretPointsDown();
}

export function addFirstTaskHidden() {
  return !elements.addFirstTask.exists();
}

export function taskCountHidden() {
  return !elements.taskCount.exists();
}

export function taskCount() {
  return elements.taskCount.text();
}

export function addTaskVisible() {
  return elements.addTask.exists();
}

export function typeTask(task: string) {
  return elements.addTaskInput.setValue(task);
}
export function addTask() {
  return elements.addTasksubmit.trigger("click");
}

export function taskListVisible(name: string) {
  return elements.addTaskListInput.text() === name;
}

export function taskVisible(taskId: string | number, task: string) {
  return elements.taskId(taskId).text() === task;
}

export function taskListCharacterCount() {
  return elements.taskListCharacterCount.text();
}

export function characterCount() {
  return elements.characterCount.text();
}

export function taskListCharacterCountHidden() {
  return elements.taskListCharacterCount.text() === "";
}

export function characterCountHidden() {
  return elements.characterCount.text() === "";
}

export async function carryTask(taskId: string | number) {
  return elements.taskCarry(taskId).trigger("click");
}

export async function tickTask(taskId: string | number) {
  return elements.taskTick(taskId).trigger("click");
}

export async function removeTask(taskId: string | number) {
  return elements.taskRemove(taskId).trigger("click");
}

export function tickTaskHidden(taskId: string | number) {
  return !elements.taskTick(taskId).exists();
}

export function carryTaskHidden(taskId: string | number) {
  return !elements.taskCarry(taskId).exists();
}

export function taskPageNumber(taskId: string | number) {
  return elements.taskPage(taskId).text();
}

export function removeTaskHidden(taskId: string | number) {
  return !elements.taskRemove(taskId).exists();
}

function mountTasksView() {
  return mount(Tasks, {
    props: {
      tasksMachineProvider: () => {
        return { snapshot: snapshot as any, send, actorRef };
      }
    }
  });
}

const elements = {
  get addTaskListPlaceholder() {
    return page.find("#add-task-list-placeholder");
  },
  get tasksListCaret() {
    return page.find("#tasks-list-input-caret");
  },
  get tasksListSelectCaret() {
    return page.find("#tasks-list-select-caret");
  },
  get addTaskListInput() {
    return page.find("#add-task-list-input");
  },
  get addTaskListSubmit() {
    return page.find("#add-task-list-submit");
  },
  get taskListSingleSelect() {
    return page.find("#task-list-single-select").element as HTMLSelectElement;
  },
  queryTaskListSingleSelect() {
    return page.find("#task-list-single-select");
  },
  get addFirstTask() {
    return page.find("#add-first-task");
  },
  get taskCount() {
    return page.find("#task-count");
  },
  get addTask() {
    return page.find("#add-task");
  },
  get addTaskInput() {
    return page.find("#add-task-input");
  },
  get addTasksubmit() {
    return page.find("#add-task-submit");
  },
  get taskListCharacterCount() {
    return page.find("#tasks-list-character-count");
  },  
  get characterCount() {
    return page.find("#character-count");
  },
  taskId(taskId: string | number) {
    return page.find(`#task-${taskId}`);
  },
  taskTick(taskId: string | number) {
    return page.find(`#task-${taskId}-tick`);
  },  
  taskCarry(taskId: string | number) {
    return page.find(`#task-${taskId}-carry`);
  },
  taskRemove(taskId: string | number) {
    return page.find(`#task-${taskId}-remove`);
  },
  taskPage(taskId: string | number) {
    return page.find(`#task-${taskId}-page`);
  },
};