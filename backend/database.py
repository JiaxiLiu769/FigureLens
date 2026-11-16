
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# 获取 database.py 所在的文件夹
BASE_DIR = Path(__file__).resolve().parent

# 数据库始终位于 backend/figures.db
DB_PATH = BASE_DIR / "figures.db"

DATABASE_URL = f"sqlite:///{DB_PATH.as_posix()}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    pass
