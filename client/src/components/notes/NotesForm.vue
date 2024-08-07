﻿<script setup lang="ts">
import { notesMachine } from "@/state-machines/notes.state-machine";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faPlusSquare } from "@fortawesome/free-regular-svg-icons";
import Note from "@/components/notes/Note.vue";
import { reactive, watch } from "vue";
import styles from "./NotesForm.module.css";
import { type EventFromLogic, type SnapshotFrom } from 'xstate'
import { NotesMachineCombinedStates } from "@/state-machines/notes.states";
import { canCarryNote } from "@/state-machines/notes.extensions";
import * as _ from "lodash";

const props = defineProps<{
  snapshot: SnapshotFrom<typeof notesMachine>;
  send: (event: EventFromLogic<typeof notesMachine>) => void;
}>();

type Model = { noteText: string };
const model: Model = reactive({ noteText: "" });
watch(model, (newValue: Model, oldValue: Model) => {
  newValue.noteText = oldValue.noteText.slice(0, 150);
});

const disabled = () => model.noteText.length === 0;
const submit = () => {
  if (disabled()) return;
  props.send({ type: "add", content: model.noteText });
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
    <div id="add-first-note" v-if="_.isEqual(snapshot.value, NotesMachineCombinedStates.addingNotesListsEmpty,)" v-on:click="send({ type: 'readyToAddFirstNote' })">
      Add your first note
    </div>
    <div :class="styles.addNote" id="add-note" v-if="_.isEqual(snapshot.value, NotesMachineCombinedStates.addingNotesListsAddingNotes)">
      <input :class="styles.input" id="add-note-input" type="text" v-model="model.noteText" />
      <FontAwesomeIcon :class="`${disabled() ? styles.disabled : ''} ${styles.addNoteIcon}`" :icon="faPlusSquare" id="add-note-submit" v-on:click="submit()"/>
      <span :class="styles.characterCount" id="character-count">{{model.noteText.length > 0 ? model.noteText.length + "/150" : "" }}</span>
    </div>
  </div>
  <div :class="`${_.isEqual(snapshot.value, NotesMachineCombinedStates.addingNotesListsAddingNotes) ? '' : `${styles.addMargin}`} ${styles.noteList}`">
    <Note v-for="note in snapshot.context.notes" :key="note.id + '.' + note.page" :note="note" :tick="tick" :carry="carry" :remove="remove"
          :choosing-notes-to-carry="_.isEqual(snapshot.value, NotesMachineCombinedStates.addingNotesListsChoosingNotesToCarry)"
          :show-tick-action="_.isEqual(snapshot.value, NotesMachineCombinedStates.addingNotesListsAddingNotes) &&
          snapshot.context.notes.find((n) => n.id === note.id && n.ticked === false) !== undefined"
          :show-carry-action="_.isEqual(snapshot.value, NotesMachineCombinedStates.addingNotesListsChoosingNotesToCarry) &&
          snapshot.context.notes.find((n) => n.id === note.id && n.carried === false && canCarryNote(n)) !== undefined"
          :show-remove-action="_.isEqual(snapshot.value, NotesMachineCombinedStates.addingNotesListsChoosingNotesToCarry) &&
        snapshot.context.notes.find((n) => n.id === note.id && n.carried === false && n.ticked === false) !== undefined"
    />
  </div>
</template>
