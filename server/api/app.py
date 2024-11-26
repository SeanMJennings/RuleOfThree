﻿from api.handlers.keep_alive_handlers import register_keep_alive_handlers
from api.handlers.tasks_list_handlers import register_task_handlers
from flask import Flask
from flask_cors import CORS
from api.handlers.exception_handlers import handle_exception


def create_app(tasks_list_service):
    app = Flask(__name__)
    CORS(app)
    register_task_handlers(app, tasks_list_service)
    register_keep_alive_handlers(app)
    app.errorhandler(Exception)(handle_exception)
    return app
