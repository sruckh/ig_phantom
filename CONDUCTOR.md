# CONDUCTOR.md - Instagram Scraper Project Management Guide

## Project Overview

Instagram Phantom (IG Phantom) - A web-based Instagram profile scraper with asynchronous job processing, featuring a Node.js proxy server, N8N workflow integration, and PhantomBuster API automation.

## Development Workflow

### 1. Task Management
- **TASKS.md**: Current development tasks and objectives
- **JOURNAL.md**: Development progress and decision log
- Update both files when making significant changes

### 2. Documentation Requirements
- Document architectural decisions in memory files
- Update CLAUDE.md with new command patterns
- Maintain changelog of major features

### 3. Git Workflow
```bash
# Standard commit workflow
git add .
git status
git commit -m "feat: description of changes

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin master
```

### 4. Memory Management
- Use Serena's memory system to document complex fixes
- Store architectural decisions and troubleshooting guides
- Reference memory files in commits for context

## Key Project Files

### Core Application
- `index.html` - Frontend web interface
- `proxy.js` - Node.js Express server with async job handling
- `database.js` - SQLite job state management
- `schema.sql` - Database schema

### Configuration
- `.env` - Environment variables (N8N, PhantomBuster API)
- `docker-compose.yml` - Container orchestration
- `Dockerfile` - Container build configuration

### Documentation
- `CLAUDE.md` - Claude Code integration instructions
- Memory files in `.serena/memories/` - Technical solutions and fixes

## Current Architecture

**Async Job Flow:**
```
Frontend → /api/start-scrape → Job ID returned → Status polling → N8N callback → Results displayed
```

**Key Components:**
- SQLite database for job state persistence
- N8N webhook integration with PhantomBuster
- Real-time job status polling (30-second intervals)
- Cancel functionality and 5-minute timeout protection
- Browser extension error filtering

## Deployment Notes

- Container runs on port 3000 (Node.js proxy server)
- Nginx Proxy Manager handles SSL and routing
- N8N workflow requires callback URL configuration
- PhantomBuster API integration for Instagram scraping