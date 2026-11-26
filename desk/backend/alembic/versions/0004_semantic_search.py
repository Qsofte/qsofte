"""semantic search: pgvector and search_chunks

Needs a Postgres with the pgvector extension (desk-db uses the pgvector/pgvector Postgres 16 image).

The switch from postgres:16-alpine (musl) to the Debian-based pgvector image changes how text
sorts, so every existing index on text is rebuilt here. On a new database this costs nothing.

Revision ID: 0004
Revises: 0003
Create Date: 2026-11-26
"""
import sqlalchemy as sa
from alembic import op
from pgvector.sqlalchemy import Vector

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None

TABLES = ["users", "domains", "initiatives", "notes", "note_initiatives", "events", "guides", "feeds", "feed_items"]


def upgrade() -> None:
    for table in TABLES:
        op.execute(f"REINDEX TABLE {table}")
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.create_table(
        "search_chunks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("kind", sa.String(length=20), nullable=False),
        sa.Column("ref_id", sa.String(length=80), nullable=False),
        sa.Column("chunk_no", sa.Integer(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("content_hash", sa.String(length=64), nullable=False),
        sa.Column("model", sa.String(length=100), nullable=False),
        sa.Column("embedding", Vector(384), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("kind", "ref_id", "chunk_no"),
    )
    op.create_index("ix_search_chunks_ref", "search_chunks", ["kind", "ref_id"])
    op.create_index("ix_search_chunks_embedding", "search_chunks", ["embedding"], postgresql_using="hnsw",
                    postgresql_with={"m": 16, "ef_construction": 64},
                    postgresql_ops={"embedding": "vector_cosine_ops"})


def downgrade() -> None:
    op.drop_index("ix_search_chunks_embedding", table_name="search_chunks")
    op.drop_index("ix_search_chunks_ref", table_name="search_chunks")
    op.drop_table("search_chunks")
    # The extension stays: other databases on the server may use it.
