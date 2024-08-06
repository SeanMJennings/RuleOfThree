import configparser

config = configparser.ConfigParser()
config.read("alembic.ini")
config["alembic"][
    "sqlalchemy.url"
] = "mssql+pyodbc://?odbc_connect=DRIVER%%3DODBC+Driver+17+for+SQL+Server%%3BSERVER%%3Dlocalhost%%3BDATABASE%%3Druleofthree%%3BUID%%3Dsa%%3BPWD%%3DYourStrong%%40Passw0rdFakeForSourceControl"

with open("alembic.ini", "w") as configfile:
    config.write(configfile)
