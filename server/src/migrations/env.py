from logging.config import fileConfig
from sqlalchemy import create_engine, exc
from sqlalchemy import engine_from_config
from sqlalchemy import pool, text
from sqlalchemy.engine import URL
import re
from alembic import context
from pathlib import Path
import yaml

secret_config_path = Path(__file__).parent / "../../secret_config.yaml"
secret_config = yaml.safe_load(open(secret_config_path))

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = None


def create_db_if_not_exists():
    db_uri = config.get_section("alembic_setup")["sqlalchemy.decoded_url"]
    database = re.search(r"DATABASE=([^;]+)", db_uri).group(1)
    db_connection_url = URL.create("mssql+pyodbc", query={"odbc_connect": db_uri})
    try:
        engine = create_engine(db_connection_url)
        with engine.connect():
            print(f"Database {database} already exists.")
    except (exc.InterfaceError, exc.OperationalError, exc.ProgrammingError):
        print(f"Database {database} does not exist. Creating now.")
        master_uri = db_uri.replace(database, "master")
        master_connection_url = URL.create(
            "mssql+pyodbc", query={"odbc_connect": master_uri}
        )
        engine = create_engine(master_connection_url)
        with engine.connect().execution_options(
            isolation_level="AUTOCOMMIT"
        ) as connection:
            connection.execute(text(f"CREATE DATABASE {database};"))
            connection.execute(
                text("sp_configure 'contained database authentication', 1; ")
            )
            connection.execute(text("RECONFIGURE;"))
            connection.execute(
                text(f"ALTER DATABASE [{database}] SET CONTAINMENT = PARTIAL")
            )
            print(f"successfully created {database} database")
        engine = create_engine(db_connection_url)
        with engine.connect().execution_options(
            isolation_level="AUTOCOMMIT"
        ) as connection:
            connection.execute(
                text(
                    f"""
                    Use [ruleofthree]
                    CREATE USER {secret_config['migration_user']} with PASSWORD = '{secret_config['migration_user_password']}'
                    exec sp_addrolemember 'db_owner', '{secret_config['migration_user']}'
                    CREATE USER {secret_config['app_user']} with PASSWORD = '{secret_config['app_user_password']}'
                    """
                )
            )
            print(f"successfully created user for {database} database")


def run_migrations_offline() -> None:
    create_db_if_not_exists()
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    create_db_if_not_exists()
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
