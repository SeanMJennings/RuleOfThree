﻿from typing import TypeVar

T = TypeVar("T")


def convert_to_domain(_type: T, items: dict):
    try:
        return _type.from_dict(next(iter(items)))
    except StopIteration:
        return None