from sqlalchemy import create_engine, text
from pathlib import Path
import yaml

path = Path(__file__).parent / "config.yaml"
config = yaml.safe_load(open(path))

secret_config_path = Path(__file__).parent / "../secret_config.yaml"
secret_config = yaml.safe_load(open(secret_config_path))


def get_sqlalchemy_db_connection():
    return create_engine(config["sqlalchemy_dburi"])


def get_pydapper_db_connection():
    import pydapper

    return pydapper.connect(
        f"mssql://{secret_config['user']}:{secret_config['password']}@{config['server']}:{config['port']}/{config['database']}",
        autocommit=True,
    )


def clear_db():
    db = get_sqlalchemy_db_connection()
    with db.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
        conn.execute(
            text(
                """EXEC sp_MSforeachtable 'if ("?" NOT IN ("[dbo].[alembic_version]")) TRUNCATE TABLE ?'"""
            )
        )
