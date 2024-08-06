import configparser

config = configparser.ConfigParser()
config.read("alembic.ini")
config["alembic"][
    "sqlalchemy.url"
] = "mssql+pyodbc://sa:YourStrong@Passw0rdFakeForSourceControl@localhost:1433/ruleofthree?driver=ODBC Driver 17 for SQL Server"

with open("alembic.ini", "w") as configfile:
    config.write(configfile)
