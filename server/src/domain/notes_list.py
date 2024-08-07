﻿import uuid

from src.domain.note import Note
from dataclasses import dataclass


# noinspection PyRedeclaration
@dataclass
class NotesList:

    def __init__(self, name: str, id: uuid = None):
        if id is None:
            id = uuid.uuid4()
        else:
            self.id = id
        self.name = name
        self.notes = []

    def add(self, note: str):
        if len(self.notes) == 22:
            raise Exception(
                "Notes list holds 22 notes. Each note must be carried or removed"
            )
        self.notes.append(Note(note))

    def tick(self, note_id: str):
        for index, note in enumerate(self.notes):
            if note.id == note_id:
                self.notes[index] = note.tick()
                return
        raise Exception("Note not found")

    def carry(self, note_id: str):
        if not self.__list_is_full():
            raise Exception("Notes list is not yet full")
        for index, note in enumerate(self.notes):
            if note.id == note_id:
                if note.page_count == 2:
                    raise Exception("Note has been carried twice and must be removed")
                if note.is_ticked:
                    raise Exception("Ticked notes cannot be carried")
                self.notes[index] = note.carry()
                self.last_note_carried_or_removed()
                return
        raise Exception("Note not found")

    def remove(self, note_id: str):
        if not self.__list_is_full():
            raise Exception("Notes list is not yet full")
        for index, note in enumerate(self.notes):
            if note.id == note_id:
                if note.is_ticked:
                    raise Exception("Ticked notes cannot be marked for removal")
                self.notes[index] = note.remove()
                self.last_note_carried_or_removed()
                return
        raise Exception("Note not found")

    def last_note_carried_or_removed(self):
        if all(
            [
                note.is_carried or note.is_removed or note.is_ticked
                for note in self.notes
            ]
        ):
            self.notes = list(
                filter(lambda n: n.is_removed is False and not n.is_ticked, self.notes)
            )
            for index, note in enumerate(self.notes):
                self.notes[index] = note.carried()

    def __list_is_full(self):
        return len(self.notes) == 22
