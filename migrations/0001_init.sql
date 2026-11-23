-- Migración 0001: Esquema inicial de tablas necesidades y votos_log

CREATE TABLE IF NOT EXISTS necesidades (
    id TEXT PRIMARY KEY,
    necesidad TEXT NOT NULL,
    molestia TEXT,
    email TEXT,
    votos INTEGER NOT NULL DEFAULT 1,
    estado TEXT NOT NULL DEFAULT 'En evaluación',
    visible INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS votos_log (
    necesidad_id TEXT NOT NULL,
    voter_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (necesidad_id, voter_hash),
    FOREIGN KEY (necesidad_id) REFERENCES necesidades(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_necesidades_visible_votos ON necesidades(visible, votos DESC);
CREATE INDEX IF NOT EXISTS idx_necesidades_created_at ON necesidades(created_at DESC);

