"""Settings, read from the environment (deploy writes them to desk.env on the server)."""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="DESK_", env_file=".env", extra="ignore")

    # postgresql+asyncpg://user:pass@host:5432/db  (tests use sqlite+aiosqlite)
    database_url: str = "postgresql+asyncpg://desk:desk@localhost:5432/desk"
    # Signs session tokens. Must be long and random in production.
    secret_key: str = "dev-only-change-me"
    session_hours: int = 12
    # Secure cookies need HTTPS; local dev over http turns this off.
    cookie_secure: bool = True
    # First sign-in account, created at start-up only if no users exist.
    admin_email: str | None = None
    admin_password: str | None = None
    admin_name: str = "Desk owner"
    # Built frontend, served by the API so the Desk is one container.
    static_dir: Path = Path(__file__).resolve().parent.parent / "static"
    environment: str = "production"

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
