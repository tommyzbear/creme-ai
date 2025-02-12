CREATE TABLE tweets (
    id TEXT PRIMARY KEY,
    tweet JSONB NOT NULL,
    -- Stores tweet data in JSONB format
    timestamp BIGINT NOT NULL -- Stores timestamp as a number (Unix epoch time)
);
-- Index on timestamp for efficient time-based queries
CREATE INDEX idx_tweets_timestamp ON tweets(timestamp);
CREATE TABLE draft_portfolio (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id TEXT NOT NULL REFERENCES account(id),
    portfolio JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    applied BOOLEAN DEFAULT FALSE
);
CREATE TABLE portfolio (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id TEXT NOT NULL REFERENCES account(id),
    portfolio JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    active BOOLEAN DEFAULT FALSE
);
CREATE TABLE chat_sessions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id TEXT NOT NULL REFERENCES account(id),
    session_id TEXT NOT NULL,
    session_name TEXT NOT NULL DEFAULT 'New Chat',
    role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Index for faster user session lookups
CREATE INDEX idx_user_id ON chat_sessions(user_id);
-- Composite index for quick session filtering and ordering
CREATE INDEX idx_session_id ON chat_sessions(session_id);
-- Index for fast searching by session name (useful if querying by name)
CREATE INDEX idx_session_name ON chat_sessions(session_name);
-- Index for sorting chat history efficiently
CREATE INDEX idx_timestamp ON chat_sessions(timestamp DESC);
CREATE TABLE news_feed (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    summary TEXT NOT NULL,
    sources TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL
);
CREATE TABLE safe_wallets (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    address TEXT NOT NULL,
    deployment_tx TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES account(id)
);