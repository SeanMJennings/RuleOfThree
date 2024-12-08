﻿from azure.cosmos import CosmosClient, PartitionKey, ContainerProxy
from api.persistence.constants import TASKS_LISTS_CONTAINER_ID, TASKS_LISTS_PARTITION_KEY_PATH
import urllib3
from pathlib import Path
import yaml
import os
from api.persistence.run_cosmos import start_and_wait_for_cosmos

path = Path(__file__).parent / "../config.yaml"
config = yaml.safe_load(open(path))

urllib3.disable_warnings()

client = None

# Only want to run if in local Windows environment
if os.name == "nt" and os.getenv("AZURE_EXTENSION_DIR") is None:
    start_and_wait_for_cosmos(config["connection_string"])

client = CosmosClient.from_connection_string(config["connection_string"])

database = client.create_database_if_not_exists(
    id=config["database"],
    offer_throughput=400,
)

tasks_lists_container: ContainerProxy = database.create_container_if_not_exists(
    id=TASKS_LISTS_CONTAINER_ID,
    partition_key=PartitionKey(
        path=TASKS_LISTS_PARTITION_KEY_PATH,
    ),
)
