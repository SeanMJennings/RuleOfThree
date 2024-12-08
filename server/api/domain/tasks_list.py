﻿import datetime
import re
import uuid
from api.domain.task import Task


class TasksList:

    def __init__(
        self,
        name: str,
        owner_email: str,
        tasks: list[Task] = None,
        id: str = None,
        last_selected_time: datetime.datetime | str = None,
        shared_with: list[str] = None,
    ):
        self.name = name
        self.owner_email = owner_email
        if last_selected_time is not None:
            self.last_selected_time = self.__get_datetime(last_selected_time)
        else:
            self.last_selected_time = datetime.datetime.now()
        if id is None:
            self.id = str(uuid.uuid4())
        else:
            self.id = id
        if tasks is not None:
            self.tasks = tasks
        else:
            self.tasks = []
        if shared_with is not None:
            self.shared_with = shared_with
        else:
            self.shared_with = []

    @staticmethod
    def from_dict(dictionary):
        return TasksList(
            dictionary["name"],
            dictionary["owner_email"],
            [Task.from_dict(task) for task in dictionary["tasks"]],
            dictionary["id"],
            dictionary["last_selected_time"],
            [shared for shared in dictionary["shared_with"]],
        )

    def to_dict(self):
        return {
            "name": self.name,
            "owner_email": self.owner_email,
            "tasks": [task.to_dict() for task in self.tasks],
            "id": self.id,
            "last_selected_time": self.last_selected_time.isoformat(),
            "shared_with": self.shared_with,
        }

    def add(self, task: str):
        if len(self.tasks) == 22:
            raise Exception(
                "Tasks list holds 22 tasks. Each task must be carried, removed or ticked"
            )
        the_task = Task(task)
        self.tasks.append(the_task)
        return the_task.id

    def the_tasks(self):
        return self.tasks

    def update_last_selected_time(self):
        self.last_selected_time = datetime.datetime.now()

    def tick(self, task_id: str):
        for index, task in enumerate(self.tasks):
            if task.id == task_id:
                self.tasks[index] = task.tick()
                self.__last_task_carried_removed_or_ticked()
                return
        raise Exception("Task not found")

    def carry(self, task_id: str):
        if not self.__list_is_full():
            raise Exception("Tasks list is not yet full")
        for index, task in enumerate(self.tasks):
            if task.id == task_id:
                if task.page_count == 2:
                    raise Exception("Task has been carried twice and must be removed")
                if task.is_ticked:
                    raise Exception("Ticked tasks cannot be carried")
                self.tasks[index] = task.carry()
                self.__last_task_carried_removed_or_ticked()
                return
        raise Exception("Task not found")

    def remove(self, task_id: str):
        if not self.__list_is_full():
            raise Exception("Tasks list is not yet full")
        for index, task in enumerate(self.tasks):
            if task.id == task_id:
                if task.is_ticked:
                    raise Exception("Ticked tasks cannot be marked for removal")
                self.tasks[index] = task.remove()
                self.__last_task_carried_removed_or_ticked()
                return
        raise Exception("Task not found")

    def share(self, email: str):
        email = email.lower()
        if email in self.shared_with:
            raise Exception("Tasks list already shared with user")
        if email == self.owner_email:
            raise Exception("Tasks list cannot be shared with owner")
        if re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", email) is None:
            raise Exception("Invalid email address")
        self.shared_with.append(email)

    def unshare(self, email: str):
        if email == self.owner_email:
            raise Exception("Tasks list cannot be unshared with owner")
        if email not in self.shared_with:
            raise Exception("Tasks list not shared with user")
        self.shared_with.remove(email)

    def __last_task_carried_removed_or_ticked(self):
        if len(self.tasks) == 22 and all(
            [
                task.is_carried or task.is_removed or task.is_ticked
                for task in self.tasks
            ]
        ):
            self.tasks = list(
                filter(lambda n: n.is_removed is False and not n.is_ticked, self.tasks)
            )
            for index, task in enumerate(self.tasks):
                self.tasks[index] = task.carried()

    def __list_is_full(self):
        return len(self.tasks) == 22

    @staticmethod
    def __get_datetime(time: str | datetime.datetime) -> datetime.datetime:
        if isinstance(time, str):
            return datetime.datetime.fromisoformat(time)
        return time
