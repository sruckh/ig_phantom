# Complete Instagram Scraper Fix Journey - Success Story

## Final Working State ✅

The Instagram scraper application is now fully functional with proper CORS handling and timeout configuration.

**GitHub Repository**: https://github.com/sruckh/ig_phantom  
**Working URL**: https://igphantom.gemneye.info  

## Architecture Overview

**Final Working Architecture**:
```
Browser (5min timeout) → NPM (5min timeout) → Nginx Container → N8N + CORS Headers → PhantomBuster → Instagram
                      ← JSON Response with CORS ←                ←                ←               ←
```

**Key Components**:
- **Frontend**: Simple nginx container serving static HTML with environment variable substitution
- **NPM**: Nginx Proxy Manager with proper timeout configuration (300s)
- **N8N**: Webhook with CORS response headers configured
- **Container Port**: 80 (nginx standard)

## Critical Fixes Applied

### 1. Browser Timeout Extension
**Problem**: Browser default fetch timeout (~90s) shorter than N8N processing time (~2-3 minutes)
**Solution**: Added AbortController with 300s (5 minute) timeout
```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 300000);
const response = await fetch(url, { signal: controller.signal });
```

### 2. NPM Timeout Configuration Fix
**Problem**: Global nginx timeouts (90s) overriding proxy-specific settings
**Solution**: Moved timeout directives to location block in NPM config
```nginx
location / {
    proxy_read_timeout 300s;
    proxy_connect_timeout 60s;
    proxy_send_timeout 300s;
    # Proxy!
    include conf.d/include/proxy.conf;
}
```
**File**: `/data/nginx/proxy_host/26.conf` in npm-app container

### 3. N8N CORS Headers
**Problem**: Browser CORS policy blocking cross-origin responses
**Solution**: Added response headers in N8N webhook response node
```json
{
    "Access-Control-Allow-Origin": "https://igphantom.gemneye.info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
}
```

### 4. Favicon Permissions Fix
**Problem**: 403 Forbidden error on favicon.svg in nginx container
**Solution**: Added proper file permissions in Dockerfile
```dockerfile
RUN chmod 644 /usr/share/nginx/html/favicon.svg
```

### 5. Environment Variable Substitution
**Working**: envsubst script properly replaces variables at container startup
```bash
envsubst '$N8N_WEBHOOK_URL $PHANTOMBUSTER_API_KEY $AGENT_ID' < /usr/share/nginx/html/index.html
```

## What NOT to Do (Lessons Learned)

### ❌ **Overcomplicated Proxy Server Approach**
- Initially tried Node.js/Express proxy server to solve CORS
- Added unnecessary complexity and new failure points
- Environment variable substitution became complicated
- Container kept restarting due to proxy issues

### ✅ **Simple nginx + N8N CORS Headers**
- Much simpler: nginx serves static files, N8N adds CORS headers
- Fewer moving parts, easier to debug
- Standard architecture pattern

## Technical Details

### Environment Variables
```bash
N8N_WEBHOOK_URL=https://n8n.gemneye.info/webhook/instagram-scraper
PHANTOMBUSTER_API_KEY=rhy49GfsS5Yqx6tIdx9V5lIdBvwF40OF0XYGEiLtqaE
AGENT_ID=4314722279551667
```

### Docker Configuration
```yaml
services:
  frontend:
    build: .
    container_name: instagram_scraper_ui
    env_file: .env
    expose: ["80"]
    networks: [shared_net]
```

### NPM Configuration
- **Target**: `instagram_scraper_ui:80`
- **Timeout Settings**: 300s in location block (not server block)
- **SSL**: Handled by NPM automatically

## Debugging Timeline

1. **Started**: Simple app that could send to N8N, but CORS blocked response
2. **Mistake**: Overcomplicated with Node.js proxy server
3. **Broke**: Environment variables, configuration errors, container restarts  
4. **Recovery**: Reverted to simple nginx + environment substitution
5. **Fix 1**: Extended browser timeout from 90s to 300s
6. **Fix 2**: Fixed NPM timeout configuration (location block vs server block)
7. **Fix 3**: Added N8N CORS headers in webhook response
8. **Fix 4**: Fixed favicon permissions in Dockerfile
9. **Success**: End-to-end flow working perfectly

## Key Insights

### Timeout Chain Must Be Consistent
Every layer in the stack must have adequate timeout:
- Browser: 300s (AbortController)
- NPM: 300s (location-specific proxy settings)  
- N8N: Unlimited processing time
- PhantomBuster: ~2-3 minutes actual processing

### CORS Headers Belong in API Response
- Don't create proxy servers to solve CORS
- Add CORS headers in the actual API (N8N webhook response)
- Much simpler and follows web standards

### Git Repository Critical for Complex Fixes
- Without git, breaking changes had no rollback path
- Lesson: Always commit working state before cosmetic changes
- Repository now established: https://github.com/sruckh/ig_phantom

## Files Structure

```
/opt/docker/ig_phantom/
├── Dockerfile                 # nginx + environment substitution
├── docker-compose.yml         # Container config, port 80
├── index.html                 # Frontend with extended timeout
├── favicon.svg               # With proper permissions
├── substitute-env.sh         # Environment variable replacement
├── .env                      # Configuration values
└── .git/                     # Version control (critical!)
```

## Testing Verification

**Expected Flow**:
1. User enters Instagram URL + session cookie
2. Frontend sends request to N8N webhook (direct call)
3. N8N processes for 2-3 minutes using PhantomBuster
4. N8N returns JSON response with CORS headers
5. Frontend displays Instagram images successfully

**No More Errors**:
- ❌ CORS policy blocking (solved with N8N headers)
- ❌ 90-second timeout (solved with extended timeouts)
- ❌ 403 Forbidden favicon (solved with permissions)
- ❌ 504 Gateway Timeout (solved with NPM location config)

## Future Maintenance

**When Making Changes**:
1. Always work in git branches
2. Test in isolation before affecting working system
3. Commit working states frequently
4. Keep architecture simple

**If CORS Issues Return**:
- Check N8N webhook response node has proper headers
- Verify NPM timeout settings in location block (not server block)
- Ensure browser timeout is adequate for N8N processing time

**Common Mistakes to Avoid**:
- Don't add proxy servers to solve CORS (add headers to API response)
- Don't put timeout settings in server block (use location block in NPM)
- Don't skip file permissions in Docker (especially for static assets)
- Don't work without git on systems that work (always commit first)

## Success Metrics

- ✅ End-to-end request/response cycle completes
- ✅ No CORS errors in browser console
- ✅ No timeout errors (90s or 504 Gateway Timeout)
- ✅ Favicon displays properly
- ✅ Instagram data loads and displays
- ✅ Consistent 2-3 minute processing time
- ✅ All configuration properly version controlled