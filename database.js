// Database utility module for async job tracking
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

class JobDatabase {
    constructor(dbPath = 'jobs.db') {
        this.dbPath = dbPath;
        this.db = null;
    }

    async initialize() {
        try {
            this.db = new Database(this.dbPath);
            console.log('✅ Connected to SQLite database:', this.dbPath);

            const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
            this.db.exec(schema);
            console.log('✅ Database schema created/verified');
        } catch (err) {
            console.error('❌ Database initialization failed:', err.message);
            throw err;
        }
    }

    async createJob(jobId, url, sessionCookie = null) {
        try {
            const query = `
                INSERT INTO scraping_jobs (id, url, session_cookie, status)
                VALUES (?, ?, ?, 'processing')
            `;

            this.db.prepare(query).run(jobId, url, sessionCookie);
            console.log(`✅ Job created: ${jobId}`);
            return { jobId, status: 'processing' };
        } catch (err) {
            console.error('❌ Job creation failed:', err.message);
            throw err;
        }
    }

    async getJob(jobId) {
        try {
            const query = `SELECT * FROM scraping_jobs WHERE id = ?`;
            const row = this.db.prepare(query).get(jobId);

            if (!row) {
                return null;
            }

            // Parse results JSON if it exists
            if (row.results) {
                try {
                    row.results = JSON.parse(row.results);
                } catch (parseErr) {
                    console.warn('⚠️ Failed to parse job results JSON:', parseErr.message);
                }
            }

            return row;
        } catch (err) {
            console.error('❌ Job lookup failed:', err.message);
            throw err;
        }
    }

    async completeJob(jobId, results, error = null) {
        try {
            const status = error ? 'failed' : 'completed';
            const resultsJson = results ? JSON.stringify(results) : null;

            const query = `
                UPDATE scraping_jobs
                SET status = ?, results = ?, error_message = ?, completed_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            const info = this.db.prepare(query).run(status, resultsJson, error, jobId);

            if (info.changes === 0) {
                console.warn('⚠️ No job found to update:', jobId);
                return null;
            }

            console.log(`✅ Job ${status}: ${jobId}`);
            return { jobId, status };
        } catch (err) {
            console.error('❌ Job completion failed:', err.message);
            throw err;
        }
    }

    async getJobsByStatus(status) {
        try {
            const query = `SELECT * FROM scraping_jobs WHERE status = ? ORDER BY created_at DESC`;
            const rows = this.db.prepare(query).all(status);

            // Parse results JSON for each row
            rows.forEach(row => {
                if (row.results) {
                    try {
                        row.results = JSON.parse(row.results);
                    } catch (parseErr) {
                        console.warn('⚠️ Failed to parse job results JSON:', parseErr.message);
                    }
                }
            });

            return rows;
        } catch (err) {
            console.error('❌ Jobs by status lookup failed:', err.message);
            throw err;
        }
    }

    async cleanup(olderThanDays = 7) {
        try {
            const query = `
                DELETE FROM scraping_jobs
                WHERE created_at < datetime('now', '-${olderThanDays} days')
            `;

            const info = this.db.prepare(query).run();
            console.log(`🧹 Cleaned up ${info.changes} old jobs`);
            return info.changes;
        } catch (err) {
            console.error('❌ Cleanup failed:', err.message);
            throw err;
        }
    }

    close() {
        if (this.db) {
            this.db.close();
            console.log('✅ Database connection closed');
        }
    }
}

module.exports = JobDatabase;
