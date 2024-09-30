﻿from typing import TypeVar

T = TypeVar("T")


def convert_to_domain(_type: T, items: dict):
    list_items = list(iter(items))
    if len(list_items) > 1:
        return [_type.from_dict(item) for item in list_items]
    if len(list_items) == 1:
        return _type.from_dict(list_items[0])
    return None
