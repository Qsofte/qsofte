"""Settings, read from the environment (deploy writes them to desk.env on the server)."""

from datetime import date, datetime
from functools import lru_cache
from zoneinfo import ZoneInfo
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
    # The Desk's working day (Today, "this week", event windows). Servers run on UTC.
    timezone: str = "Australia/Sydney"
    # Feeds: refresh every N minutes inside the app; 0 turns the background refresh off.
    feed_interval_minutes: int = 180
    # Ask: answers questions from Desk content with Claude. Off when no key is set.
    anthropic_api_key: str | None = None
    ask_model: str = "claude-opus-5-5"
    ask_per_hour: int = 30

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


def local_today() -> date:
    """Today in the Desk's time zone, not the server's."""
    return datetime.now(ZoneInfo(get_settings().timezone)).date()
