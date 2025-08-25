// Database utility module for async job tracking
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class JobDatabase {
    constructor(dbPath = 'jobs.db') {
        this.dbPath = dbPath;
        this.db = null;
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('❌ Database connection failed:', err.message);
                    reject(err);
                    return;
                }
                console.log('✅ Connected to SQLite database:', this.dbPath);
                this.createTables().then(resolve).catch(reject);
            });
        });
    }

    async createTables() {
        return new Promise((resolve, reject) => {
            const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
            this.db.exec(schema, (err) => {
                if (err) {
                    console.error('❌ Schema creation failed:', err.message);
                    reject(err);
                    return;
                }
                console.log('✅ Database schema created/verified');
                resolve();
            });
        });
    }

    async createJob(jobId, url, sessionCookie = null) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO scraping_jobs (id, url, session_cookie, status) 
                VALUES (?, ?, ?, 'processing')
            `;
            
            this.db.run(query, [jobId, url, sessionCookie], function(err) {
                if (err) {
                    console.error('❌ Job creation failed:', err.message);
                    reject(err);
                    return;
                }
                console.log(`✅ Job created: ${jobId}`);
                resolve({ jobId, status: 'processing' });
            });
        });
    }

    async getJob(jobId) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM scraping_jobs WHERE id = ?`;
            
            this.db.get(query, [jobId], (err, row) => {
                if (err) {
                    console.error('❌ Job lookup failed:', err.message);
                    reject(err);
                    return;
                }
                
                if (!row) {
                    resolve(null);
                    return;
                }

                // Parse results JSON if it exists
                if (row.results) {
                    try {
                        row.results = JSON.parse(row.results);
                    } catch (parseErr) {
                        console.warn('⚠️ Failed to parse job results JSON:', parseErr.message);
                    }
                }

                resolve(row);
            });
        });
    }

    async completeJob(jobId, results, error = null) {
        return new Promise((resolve, reject) => {
            const status = error ? 'failed' : 'completed';
            const resultsJson = results ? JSON.stringify(results) : null;
            
            const query = `
                UPDATE scraping_jobs 
                SET status = ?, results = ?, error_message = ?, completed_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            
            this.db.run(query, [status, resultsJson, error, jobId], function(err) {
                if (err) {
                    console.error('❌ Job completion failed:', err.message);
                    reject(err);
                    return;
                }
                
                if (this.changes === 0) {
                    console.warn('⚠️ No job found to update:', jobId);
                    resolve(null);
                    return;
                }
                
                console.log(`✅ Job ${status}: ${jobId}`);
                resolve({ jobId, status });
            });
        });
    }

    async getJobsByStatus(status) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM scraping_jobs WHERE status = ? ORDER BY created_at DESC`;
            
            this.db.all(query, [status], (err, rows) => {
                if (err) {
                    console.error('❌ Jobs by status lookup failed:', err.message);
                    reject(err);
                    return;
                }
                
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
                
                resolve(rows);
            });
        });
    }

    async cleanup(olderThanDays = 7) {
        return new Promise((resolve, reject) => {
            const query = `
                DELETE FROM scraping_jobs 
                WHERE created_at < datetime('now', '-${olderThanDays} days')
            `;
            
            this.db.run(query, [], function(err) {
                if (err) {
                    console.error('❌ Cleanup failed:', err.message);
                    reject(err);
                    return;
                }
                console.log(`🧹 Cleaned up ${this.changes} old jobs`);
                resolve(this.changes);
            });
        });
    }

    close() {
        return new Promise((resolve) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        console.error('❌ Database close error:', err.message);
                    } else {
                        console.log('✅ Database connection closed');
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

module.exports = JobDatabase;