import configparser

config = configparser.ConfigParser()
config.read("alembic.ini")
config["alembic"][
    "sqlalchemy.url"
] = "mssql://sa:YourStrong@Passw0rdFakeForSourceControl@localhost/ruleofthree"

with open("alembic.ini", "w") as configfile:
    config.write(configfile)
