from sqlalchemy import Column, Integer, MetaData, String, Table

metadata = MetaData()

users = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("username", String(50), unique=True, nullable=False, index=True),
    Column("password", String(255), nullable=False),
)
