# Suggested Development Commands

## Docker Development Commands

### Building and Running
```bash
# Build the Docker container
docker build -t ig-phantom .

# Run with docker-compose (recommended)
docker-compose up -d

# Run container directly
docker run -d --name instagram_scraper_ui \
  --env-file .env \
  -p 8080:80 \
  ig-phantom

# View logs
docker-compose logs -f frontend
docker logs instagram_scraper_ui

# Stop services
docker-compose down
```

### Development Workflow
```bash
# Edit files locally - changes require rebuild
# After making changes to index.html:
docker-compose down
docker-compose up --build

# Quick restart without rebuild (for .env changes only)
docker-compose restart
```

## Environment Configuration
```bash
# Edit environment variables
nano .env

# Required variables:
# N8N_WEBHOOK_URL=https://your-n8n-instance/webhook/instagram-scraper
# PHANTOMBUSTER_API_KEY=your-phantom-api-key
# AGENT_ID=your-phantom-agent-id
```

## Testing and Debugging
```bash
# Test the application
# 1. Open browser to http://localhost:8080 (or exposed port)
# 2. Enter a valid Instagram profile URL
# 3. Optionally add session cookie for better results
# 4. Click "Scrape Images" and verify workflow

# Debug container issues
docker exec -it instagram_scraper_ui sh
docker inspect instagram_scraper_ui

# Check nginx configuration
docker exec -it instagram_scraper_ui cat /etc/nginx/nginx.conf
```

## Network and Service Integration
```bash
# Ensure shared network exists
docker network create shared_net

# Connect to other services in the network
docker-compose up -d  # automatically connects to shared_net

# Verify network connectivity
docker network inspect shared_net
```

## File Operations
```bash
# View current files
ls -la

# Edit main application file
nano index.html

# Edit Docker configuration
nano Dockerfile
nano docker-compose.yml

# Check environment substitution
docker exec -it instagram_scraper_ui cat /usr/share/nginx/html/index.html
```

## System Commands (Linux)
```bash
# Basic file operations
ls -la          # List files with details
pwd             # Print working directory
cd /path        # Change directory
grep -r "text"  # Search for text in files
find . -name "*.html"  # Find files by pattern

# Process management
ps aux          # List running processes
top             # Monitor system resources
df -h           # Check disk usage
```

## No Traditional Development Commands
**Note**: This project has no package.json, so there are no npm/yarn commands for:
- Linting (no ESLint configuration)
- Formatting (no Prettier configuration)  
- Testing (no test framework setup)
- Build process (static files served directly)

All "building" happens through Docker's envsubst process that replaces environment variables in the HTML file.