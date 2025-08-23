# IG Phantom - Instagram Profile Scraper

## Project Purpose
IG Phantom is a web-based Instagram profile scraper that allows users to:
- Enter Instagram profile URLs
- Scrape and download images from those profiles
- Use PhantomBuster API for web scraping automation
- Process results through N8N workflow automation
- Download selected images as a ZIP file

## Key Features
- Modern web interface built with Tailwind CSS
- Integration with PhantomBuster for Instagram scraping
- N8N webhook integration for workflow automation
- Batch image selection and ZIP download functionality
- Session cookie support for improved scraping results
- Environment variable configuration for API keys and endpoints

## Architecture
- **Frontend**: Single-page application (SPA) using vanilla HTML/JavaScript
- **Backend**: Nginx serving static files with environment variable substitution
- **External Services**: PhantomBuster API, N8N workflow automation
- **Deployment**: Docker container with shared network for service integration

## Target Use Case
This tool is designed for legitimate Instagram profile analysis and content archiving, with proper authentication and rate limiting through PhantomBuster's API.