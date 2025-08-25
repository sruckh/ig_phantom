-- Instagram Scraping Jobs Database Schema
-- SQLite database for async job tracking

CREATE TABLE IF NOT EXISTS scraping_jobs (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'processing',
    url TEXT NOT NULL,
    session_cookie TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    results TEXT, -- JSON string
    error_message TEXT
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_created ON scraping_jobs(created_at);

-- Sample data for testing
-- INSERT INTO scraping_jobs (id, status, url) VALUES ('test-123', 'processing', 'https://instagram.com/test');