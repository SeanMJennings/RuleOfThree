import configparser

config = configparser.ConfigParser()
config.read("alembic.ini")
config["alembic"][
    "sqlalchemy.url"
] = "mssql+pyodbc://sa:YourStrong@Passw0rdFakeForSourceControl@127.0.0.1:1433/ruleofthree?driver=ODBC Driver 17 for SQL Server"

with open("alembic.ini", "w") as configfile:
    config.write(configfile)
