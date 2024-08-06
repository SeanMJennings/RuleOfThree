from logging.config import fileConfig
from sqlalchemy import create_engine, exc
from sqlalchemy import engine_from_config
from sqlalchemy import pool, text
from sqlalchemy_utils import create_database
import re
from alembic import context
from pathlib import Path
from sqlalchemy.engine import URL
import yaml

secret_config_path = Path(__file__).parent / "../../secret_config.yaml"
secret_config = yaml.safe_load(open(secret_config_path))

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
target_metadata = None

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def create_db_if_not_exists():
    #db_uri = config.get_section(config.config_ini_section, {})["sqlalchemy.url"]
    #database = re.search(r"^(?P<dbname>[^?]+)", db_uri.split("/")[-1]).group("dbname")
    database = "ruleofthree"
    # try:
    connection_string = "DRIVER=ODBC Driver 17 for SQL Server;SERVER=localhost;UID=sa;PWD=YourStrong@Passw0rdFakeForSourceControl"
    connection_url = URL.create(
        "mssql+pyodbc", query={"odbc_connect": connection_string}
    )
    print(connection_url)
    # engine = create_engine(connection_url)
    # print("end of alternate test")
    # engine = create_engine(db_uri)
    # with engine.connect():
    #    print(f"Database {database} already exists.")
    # except (exc.InterfaceError, exc.OperationalError, exc.ProgrammingError):
    print(f"Database {database} does not exist. Creating now.")
    # create_database(connection_url)
    master_connection_string = "DRIVER=ODBC Driver 17 for SQL Server;SERVER=localhost;DATABASE=master;UID=sa;PWD=YourStrong@Passw0rdFakeForSourceControl"
    master_connection_url = URL.create(
        "mssql+pyodbc", query={"odbc_connect": master_connection_string}
    )
    # engine = create_engine(connection_url.replace(database, "master"))
    engine = create_engine(master_connection_url)
    print("successfully connected to server")
    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as connection:
        connection.execute(text(f"CREATE DATABASE {database};"))
        print("successfully created database")
        connection.execute(
            text("sp_configure 'contained database authentication', 1; ")
        )
        print("successfully executed sp_configure")
        connection.execute(text("RECONFIGURE;"))
        connection.execute(
            text(f"ALTER DATABASE [{database}] SET CONTAINMENT = PARTIAL")
        )
        print("successfully executed ALTER DATABASE")
    engine = create_engine(connection_url)
    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as connection:
        connection.execute(
            text(
                f"""
                Use [ruleofthree]
                GO
                CREATE USER {secret_config['user']} with PASSWORD = '{secret_config['password']}';
                GO
                """
            )
        )
        print("successfully created user")


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
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
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
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
