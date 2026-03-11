from sqlalchemy import Column, Integer, MetaData, String, Table

metadata = MetaData()

users = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("username", String(50), unique=True, nullable=False, index=True),
    Column("password", String(255), nullable=False),
)

recipes = Table(
    "recipes",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String(255), nullable=False),
    Column("description", String(255), nullable=True),
    Column("ingredients", String(255), nullable=False),
    Column("instructions", String(255), nullable=False),
    Column("prep_time", Integer, nullable=False),
    Column("cook_time", Integer, nullable=False),
    Column("servings", Integer, nullable=False),
)
