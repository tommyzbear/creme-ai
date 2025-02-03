CREATE TABLE tweets (
    id TEXT PRIMARY KEY,
    tweet JSONB NOT NULL,
    -- Stores tweet data in JSONB format
    timestamp BIGINT NOT NULL -- Stores timestamp as a number (Unix epoch time)
);
-- Index on timestamp for efficient time-based queries
CREATE INDEX idx_tweets_timestamp ON tweets(timestamp);