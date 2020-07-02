from typing import Dict
from threading import Lock

from .core import Core as _Core

_singleton_core = None
_current_definition: dict = {}
_execution_counter: int = 0
_history_cache: Dict[int, dict] = {}
global_lock = Lock()


def is_init() -> bool:
    return True if _singleton_core is not None else False


def reset_and_init(table_definition: dict):
    with global_lock:
        global _execution_counter, _singleton_core, _history_cache, _current_definition
        _history_cache = {}
        _execution_counter = 0
        _current_definition = table_definition
        _singleton_core = _Core(table_definition, [])


def execute_one_sql(sql_stam: str):
    with global_lock:
        global _execution_counter, _singleton_core

        if _singleton_core is None:
            raise Exception('core is not initialized!')

        _execution_counter += 1
        sql_request = {'sql_expr': sql_stam, 'serial_number': _execution_counter}
        sql_result = _singleton_core.execute_sql_expr(sql_request)
        _history_cache[_execution_counter] = sql_result
        return sql_result


def gen_bplustree_picture(output_path: str, attribute: int):
    with global_lock:
        global _singleton_core, _current_definition

        if _singleton_core is None:
            raise Exception('core is not initialized!')

        if attribute not in _current_definition or _current_definition[attribute].get('is_key', False) is not True:
            raise Exception(f'Attribute-{str(attribute)} is not an index!')

        _singleton_core.generate_index_picture(output_path, attribute)


def query_history(serial_number: int) -> dict:
    return _history_cache.get(serial_number, None)


def get_current_definition() -> dict:
    return _current_definition
