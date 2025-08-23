# Technology Stack

## Frontend Technologies
- **HTML5**: Semantic markup and structure
- **Vanilla JavaScript (ES6+)**: Modern JavaScript features including:
  - Async/await for API calls
  - Arrow functions
  - Template literals
  - Destructuring
  - Fetch API
- **Tailwind CSS**: Utility-first CSS framework for styling
- **JSZip**: Client-side ZIP file generation library

## Backend & Infrastructure
- **Nginx 1.25-alpine**: Lightweight web server for static file serving
- **Docker**: Containerization with multi-stage builds
- **Docker Compose**: Service orchestration
- **Alpine Linux**: Base OS for minimal container size

## External APIs & Services
- **PhantomBuster API**: Web scraping automation platform
- **N8N**: Workflow automation and webhook processing
- **Instagram**: Target platform for profile scraping

## Development Tools
- **gettext/envsubst**: Environment variable substitution in HTML
- **Docker**: Development and deployment environment
- **Shared networking**: Docker network for service communication

## Dependencies
- No package.json or npm dependencies (uses CDN links)
- External CDN dependencies:
  - Tailwind CSS (via CDN)
  - JSZip (via CDN)

## File Structure
```
ig_phantom/
├── .env                # Environment configuration
├── Dockerfile          # Container build instructions
├── docker-compose.yml  # Service orchestration
└── index.html          # Single-page application
```