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