"""full-text search: unaccent, pg_trgm, the 'desk' text search configuration, search vectors

Each searchable table gets a stored, generated tsvector (Postgres keeps it in step with the row)
and a GIN index. The expressions come from app.models.search_expression, so model and database
cannot disagree.

Revision ID: 0003
Revises: 0002
Create Date: 2026-11-26
"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import TSVECTOR

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None

# Copied, not imported: a migration must keep meaning what it meant when it was written.
EXPRESSIONS = {
    "domains": "setweight(to_tsvector('desk', coalesce(name, '')), 'A') || setweight(to_tsvector('desk', coalesce(summary, '') || ' ' || coalesce(position, '')), 'B') || setweight(to_tsvector('desk', coalesce(open_questions, '') || ' ' || coalesce(capability_evidence, '')), 'C')",
    "initiatives": "setweight(to_tsvector('desk', coalesce(name, '') || ' ' || coalesce(aliases, '')), 'A') || setweight(to_tsvector('desk', coalesce(summary, '') || ' ' || coalesce(lead, '')), 'B') || setweight(to_tsvector('desk', coalesce(participants, '')), 'C')",
    "notes": "setweight(to_tsvector('desk', coalesce(title, '')), 'A') || setweight(to_tsvector('desk', coalesce(so_what, '')), 'B') || setweight(to_tsvector('desk', coalesce(body, '')), 'C')",
    "guides": "setweight(to_tsvector('desk', coalesce(title, '')), 'A') || setweight(to_tsvector('desk', coalesce(summary, '')), 'B') || setweight(to_tsvector('desk', coalesce(body, '')), 'C')",
    "events": "setweight(to_tsvector('desk', coalesce(name, '')), 'A') || setweight(to_tsvector('desk', coalesce(why, '') || ' ' || coalesce(goal, '')), 'B') || setweight(to_tsvector('desk', coalesce(organiser, '') || ' ' || coalesce(city, '')), 'C')",
    "feed_items": "setweight(to_tsvector('desk', coalesce(title, '')), 'A') || setweight(to_tsvector('desk', coalesce(summary, '')), 'C')",
}


def upgrade() -> None:
    # Both ship with Postgres (contrib) and are trusted, so the Desk's own user can enable them.
    op.execute("CREATE EXTENSION IF NOT EXISTS unaccent")
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    # English stemming, accents removed first: 'Agorá' is found by 'agora'.
    op.execute("""
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_ts_config WHERE cfgname = 'desk') THEN
            CREATE TEXT SEARCH CONFIGURATION desk (COPY = english);
            ALTER TEXT SEARCH CONFIGURATION desk
              ALTER MAPPING FOR hword, hword_part, word WITH unaccent, english_stem;
          END IF;
        END
        $$;
    """)
    for table, expression in EXPRESSIONS.items():
        op.add_column(table, sa.Column("search_vector", TSVECTOR(), sa.Computed(expression, persisted=True), nullable=True))
        op.create_index(f"ix_{table}_search", table, ["search_vector"], unique=False, postgresql_using="gin")


def downgrade() -> None:
    for table in EXPRESSIONS:
        op.drop_index(f"ix_{table}_search", table_name=table, postgresql_using="gin")
        op.drop_column(table, "search_vector")
    op.execute("DROP TEXT SEARCH CONFIGURATION IF EXISTS desk")
    # The extensions stay: dropping them could break anything else that uses them.
