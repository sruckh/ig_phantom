# SQLite3 to Better-SQLite3 Migration and Configuration Fixes

## Problem Summary

The application was experiencing SIGSEGV (segmentation fault) crashes after attempting to increase the scraping limit from 100 to 200 items. Additionally, the N8N webhook callback was broken.

## Root Causes

1. **SIGSEGV Crashes**: The `sqlite3` npm package was causing segmentation faults on Alpine Linux, even after proper compilation with build dependencies
2. **Broken Callback URL**: Missing `CALLBACK_BASE_URL` environment variable caused N8N callbacks to use `http://localhost:3000` instead of the Docker network address
3. **Async Architecture Required**: The async job architecture with SQLite persistence is critical for working around Cloudflare's ~90 second timeout constraint (scrapes take 3-4 minutes)

## Solution Implementation

### 1. Replaced sqlite3 with better-sqlite3

**Why**: `better-sqlite3` is more stable, better maintained, and has fewer Alpine Linux compatibility issues.

**Files Modified**:
- `package.json`: Replaced `"sqlite3": "^5.1.6"` with `"better-sqlite3": "^9.2.2"`
- `Dockerfile`: Changed rebuild command from `sqlite3` to `better-sqlite3`
- `Dockerfile`: Pinned base image to `node:18-alpine3.19` (has distutils support)

**database.js Rewrite**:
Converted from sqlite3's callback-based API to better-sqlite3's synchronous API:

```javascript
// Before (sqlite3 - callback-based)
this.db = new sqlite3.Database(this.dbPath, (err) => {
    if (err) { reject(err); return; }
    this.createTables().then(resolve).catch(reject);
});

// After (better-sqlite3 - synchronous)
this.db = new Database(this.dbPath);
console.log('✅ Connected to SQLite database:', this.dbPath);
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
this.db.exec(schema);
```

All database methods updated similarly:
- `createJob()`: Uses `db.prepare(query).run()`
- `getJob()`: Uses `db.prepare(query).get()`
- `completeJob()`: Uses `db.prepare(query).run()` with `info.changes` check
- `getJobsByStatus()`: Uses `db.prepare(query).all()`
- `cleanup()`: Uses `db.prepare(query).run()` with `info.changes`

### 2. Fixed Callback URL Configuration

**Problem**: N8N couldn't reach callback at `http://localhost:3000/api/scrape-complete`

**Solution**: Added to `.env`:
```bash
CALLBACK_BASE_URL=http://instagram_scraper_ui:3000
```

This uses Docker's `shared_net` network where container name `instagram_scraper_ui` resolves to the container's IP address, allowing N8N to successfully callback.

### 3. Increased Scraping Limit

**Added to `.env`**:
```bash
POSTS_PER_PROFILE=200
```

**Already in proxy.js (line 242)**:
```javascript
numberOfPostsPerProfile: parseInt(process.env.POSTS_PER_PROFILE) || 100,
```

## Architecture Preserved

The async job architecture was maintained (required for Cloudflare timeout workaround):
- **Job Creation**: POST `/api/start-scrape` creates job, starts N8N processing, returns jobId
- **Status Polling**: GET `/api/job-status/:jobId` checks job status in SQLite
- **Callback Handling**: POST `/api/scrape-complete` receives N8N callback, updates job in SQLite
- **Frontend Polling**: index.html polls status every 30 seconds with 5-minute timeout

## Files Modified

1. `package.json` - Replaced sqlite3 with better-sqlite3
2. `database.js` - Complete rewrite for better-sqlite3 API
3. `Dockerfile` - Alpine 3.19 pinning, better-sqlite3 rebuild
4. `.env` - Added POSTS_PER_PROFILE=200 and CALLBACK_BASE_URL
5. `proxy.js` - Already had environment variable support (no changes needed)

## Verification

Container runs successfully with:
- ✅ No SIGSEGV crashes
- ✅ Database connects and schema created
- ✅ CALLBACK_BASE_URL=http://instagram_scraper_ui:3000
- ✅ POSTS_PER_PROFILE=200
- ✅ Healthcheck passing

## Important Notes

- **Do NOT use sqlite3 on Alpine Linux** - use better-sqlite3 instead
- **Callback URL must use Docker network** - container name, not localhost
- **Async architecture is mandatory** - don't remove for Cloudflare timeout workaround
- **Alpine 3.19 pinned** - newer versions removed distutils from Python
