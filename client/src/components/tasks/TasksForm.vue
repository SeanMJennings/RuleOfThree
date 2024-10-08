﻿<script setup lang="ts">
import { tasksMachine } from "@/state-machines/tasks.state-machine";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faPlusSquare } from "@fortawesome/free-regular-svg-icons";
import Task from "@/components/tasks/Task.vue";
import { reactive, watch } from "vue";
import styles from "./TasksForm.module.css";
import { type EventFromLogic, type SnapshotFrom } from 'xstate'
import { TasksMachineCombinedStates } from "@/state-machines/tasks.states";
import { canCarryTask } from "@/state-machines/tasks.extensions";
import * as _ from "lodash";

const props = defineProps<{
  snapshot: SnapshotFrom<typeof tasksMachine>;
  send: (event: EventFromLogic<typeof tasksMachine>) => void;
}>();

type Model = { taskText: string };
const model: Model = reactive({ taskText: "" });
watch(model, (newValue: Model, oldValue: Model) => {
  newValue.taskText = oldValue.taskText.slice(0, 150);
});

const disabled = () => model.taskText.length === 0;
const submit = () => {
  if (disabled()) return;
  props.send({ type: "add", content: model.taskText });
};
const tick = (id: string | number) => {
  props.send({ type: "tick", id: id });
};
const carry = (id: string | number) => {
  props.send({ type: "carry", id: id });
};
const remove = (id: string | number) => {
  props.send({ type: "remove", id: id });
};
</script>

<template>
  <div :class="styles.container">
    <div id="add-first-task" v-if="_.isEqual(snapshot.value, TasksMachineCombinedStates.addingTasksListsEmpty,)" v-on:click="send({ type: 'readyToAddFirstTask' })">
      Add your first task
    </div>
    <div :class="styles.addTask" id="add-task" v-if="_.isEqual(snapshot.value, TasksMachineCombinedStates.addingTasksListsAddingTasks)">
      <input :class="styles.input" id="add-task-input" type="text" v-model="model.taskText" />
      <FontAwesomeIcon :class="`${disabled() ? styles.disabled : ''} ${styles.addTaskIcon}`" :icon="faPlusSquare" id="add-task-submit" v-on:click="submit()"/>
      <span :class="styles.characterCount" id="character-count">{{model.taskText.length > 0 ? model.taskText.length + "/150" : "" }}</span>
    </div>
  </div>
  <div :class="`${_.isEqual(snapshot.value, TasksMachineCombinedStates.addingTasksListsAddingTasks) ? '' : `${styles.addMargin}`} ${styles.taskList}`">
    <Task v-for="task in snapshot.context.tasks" :key="task.id + '.' + task.page" :task="task" :tick="tick" :carry="carry" :remove="remove"
          :choosing-tasks-to-carry="_.isEqual(snapshot.value, TasksMachineCombinedStates.addingTasksListsChoosingTasksToCarry)"
          :show-tick-action="_.isEqual(snapshot.value, TasksMachineCombinedStates.addingTasksListsAddingTasks) &&
          snapshot.context.tasks.find((n) => n.id === task.id && n.ticked === false) !== undefined"
          :show-carry-action="_.isEqual(snapshot.value, TasksMachineCombinedStates.addingTasksListsChoosingTasksToCarry) &&
          snapshot.context.tasks.find((n) => n.id === task.id && n.carried === false && canCarryTask(n)) !== undefined"
          :show-remove-action="_.isEqual(snapshot.value, TasksMachineCombinedStates.addingTasksListsChoosingTasksToCarry) &&
        snapshot.context.tasks.find((n) => n.id === task.id && n.carried === false && n.ticked === false) !== undefined"
    />
  </div>
</template>
