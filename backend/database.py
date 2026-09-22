"""
Database engine / session setup.

Local development  → SQLite (zero setup, file-based).
Production / staging → PostgreSQL (set DATABASE_URL).

    # local (default, no .env needed)
    DATABASE_URL=sqlite:///./taskr.db   # resolved to backend/taskr.db

    # production example
    DATABASE_URL=postgresql://user:password@localhost:5432/finance
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Absolute path keeps one single SQLite file no matter which directory
# uvicorn is launched from (previously a relative ./taskr.db created a
# different empty DB per working directory — accounts "vanished").
DEFAULT_SQLITE_URL = f"sqlite:///{os.path.join(_BASE_DIR, 'taskr.db')}"

DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_SQLITE_URL).strip() or DEFAULT_SQLITE_URL

# Render / Heroku give postgres:// but SQLAlchemy needs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

IS_SQLITE = DATABASE_URL.startswith("sqlite")

if IS_SQLITE:
    # check_same_thread=False is required for FastAPI's threaded dev server.
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
else:
    # PostgreSQL: pre-ping drops stale pooled connections (common on
    # hosted Postgres after idle periods).
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def is_sqlite() -> bool:
    return IS_SQLITE
