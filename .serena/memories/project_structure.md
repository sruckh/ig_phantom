# Project Structure and Architecture

## Directory Structure
```
ig_phantom/
├── .env                    # Environment variables (API keys, URLs)
├── .serena/               # Serena configuration (auto-generated)
├── Dockerfile             # Container build instructions
├── docker-compose.yml     # Service orchestration
└── index.html             # Single-page application (main file)
```

## Application Architecture

### Single-Page Application (SPA)
- **File**: `index.html` (13.5KB)
- **Structure**: Complete application in one HTML file
- **Sections**:
  - HTML structure and metadata
  - Tailwind CSS styling
  - JavaScript application logic

### Frontend Components
1. **Header Section**: Title and description
2. **Input Form**: URL input and session cookie field
3. **Action Buttons**: Scrape button, download controls
4. **Results Display**: Image grid with selection controls
5. **Status Messages**: Success/error feedback

### JavaScript Modules (within index.html)
1. **Configuration** (lines 60-65)
   - Environment variable placeholders
   - API endpoints and keys
   
2. **State Management** (lines 66-82)
   - Global state variables
   - DOM element references
   
3. **Helper Functions** (lines 84-141)
   - `showMessage()`: User feedback
   - `setLoading()`: Loading states
   - `updateSelectionUI()`: Image selection
   
4. **Core Logic** (lines 143-297)
   - Scraping workflow
   - Image selection/download
   - ZIP file generation

### Data Flow
```
User Input → N8N Webhook → PhantomBuster API → Instagram → Results → UI Display
```

1. User enters Instagram URL and optional session cookie
2. Frontend validates input and sends POST to N8N webhook
3. N8N triggers PhantomBuster agent with scraping parameters
4. PhantomBuster scrapes Instagram profile images
5. Results returned as JSON with image URLs
6. Frontend displays images in grid with selection controls
7. User selects images and downloads as ZIP file

### Environment Configuration
- **Build-time**: Environment variables substituted into HTML during Docker build
- **Runtime**: No dynamic configuration loading
- **Required Variables**:
  - `N8N_WEBHOOK_URL`: N8N workflow trigger endpoint
  - `PHANTOMBUSTER_API_KEY`: PhantomBuster authentication
  - `AGENT_ID`: Specific PhantomBuster agent identifier

### Docker Architecture
- **Base Image**: nginx:1.25-alpine (minimal web server)
- **Build Process**: 
  1. Install gettext for envsubst utility
  2. Copy HTML file to nginx document root
  3. Create startup script for environment substitution
  4. Configure nginx to serve static files
- **Runtime**: Environment variables replaced in HTML, nginx serves content