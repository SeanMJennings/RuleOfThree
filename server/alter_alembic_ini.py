import configparser
from sqlalchemy.engine import URL

config = configparser.ConfigParser()
config.read("alembic.ini")
master_connection_string = "DRIVER=ODBC Driver 17 for SQL Server;SERVER=localhost;DATABASE=ruleofthree;UID=sa;PWD=YourStrong@Passw0rdFakeForSourceControl"
master_connection_url = URL.create(
    "mssql+pyodbc", query={"odbc_connect": master_connection_string}
)
config["alembic"]["sqlalchemy.url"] = master_connection_url

with open("alembic.ini", "w") as configfile:
    config.write(configfile)
