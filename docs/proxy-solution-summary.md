# CORS Fix: Server-Side Proxy Solution

## Problem Summary

The frontend was blocked by CORS policy when calling N8N directly:
```
Access to fetch at 'https://n8n.gemneye.info/webhook/instagram-scraper' from origin 'https://igphantom.gemneye.info' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

Adding CORS headers to N8N didn't work because the request was timing out after 90+ seconds.

## Solution Implemented

**Server-Side Proxy Architecture:**
```
Browser → Node.js Proxy Server → N8N Webhook → PhantomBuster → Instagram
```

### Key Files Created/Modified:

1. **`proxy.js`** - Express server that proxies requests to N8N
2. **`package.json`** - Node.js dependencies 
3. **`Dockerfile`** - Updated to use Node.js instead of nginx
4. **`docker-compose.yml`** - Updated ports and health checks
5. **`index.html`** - Updated to call `/api/webhook/instagram-scraper` instead of N8N directly

### Proxy Server Features:

- **CORS Handling**: Automatically adds proper CORS headers
- **Extended Timeout**: 5-minute timeout for long-running scraping jobs  
- **Enhanced Logging**: Detailed request/response logging for debugging
- **Error Handling**: Proper error messages and status codes
- **Health Check**: `/health` endpoint for monitoring
- **Static File Serving**: Serves the frontend HTML/JS/CSS

### Frontend Changes:

```javascript
// Before (Direct N8N call - CORS blocked)
fetch('https://n8n.gemneye.info/webhook/instagram-scraper', {...})

// After (Proxy call - No CORS issues)  
fetch('/api/webhook/instagram-scraper', {...})
```

## Benefits of This Solution

1. **✅ No CORS Issues** - Server-to-server communication bypasses browser CORS
2. **✅ Better Security** - API keys not exposed in browser network tab
3. **✅ Extended Timeouts** - 5-minute timeout vs browser's ~90 second limit
4. **✅ Enhanced Logging** - Server-side logging for better debugging
5. **✅ Future Extensibility** - Can add validation, caching, rate limiting

## Testing the Solution

1. **Health Check**: `curl http://localhost:5173/health`
2. **Frontend**: Visit `https://igphantom.gemneye.info/`  
3. **Browser Console**: Should show proxy URL instead of N8N URL
4. **Expected Flow**: Request → Proxy → N8N → Response (no CORS errors)

## Container Architecture

```yaml
services:
  frontend:
    build: .                    # Node.js + Express (was nginx)
    ports:
      - "5173:3000"            # Proxy server port
    environment:
      - PORT=3000
    healthcheck:
      test: ["CMD", "wget", "http://localhost:3000/health"]
```

## Next Steps

1. **Test the new proxy solution** with a real Instagram scraping request
2. **Monitor proxy logs** to see request/response flow
3. **Verify no CORS errors** in browser console
4. **Confirm timing improvements** with extended server-side timeout

The proxy server is now running and ready for testing!