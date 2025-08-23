# Favicon Setup Solution for Docker Node.js Apps

## Problem
SVG favicon files show 500 errors in Docker containers when using non-root user.

## Root Cause
Files copied to Docker container have restrictive permissions that the non-root user cannot read.

## Solution

### 1. Fix Dockerfile Permissions
Add proper file ownership and permissions after copying files:

```dockerfile
# Copy application files
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Fix file permissions and ownership BEFORE switching user
RUN chown -R nextjs:nodejs /app && chmod 644 /app/favicon.svg

USER nextjs
```

### 2. Simple Express Static Serving
Let Express static middleware handle the SVG file with proper MIME type:

```javascript
// Serve static files with proper MIME types
app.use(express.static('.', {
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.svg')) {
            res.setHeader('Content-Type', 'image/svg+xml');
        }
    }
}));

// Optional: Explicit ICO fallback to SVG
app.get('/favicon.ico', (req, res) => {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.sendFile(path.join(__dirname, 'favicon.svg'), (err) => {
        if (err) {
            console.error('❌ Favicon error:', err.message);
            res.status(404).send('Favicon not found');
        }
    });
});
```

### 3. HTML Reference
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="alternate icon" href="/favicon.ico">
```

## Key Points
- Fix permissions in Dockerfile, not in running container
- Use static middleware for SVG, explicit route for ICO fallback
- Don't overcomplicate with explicit SVG routes - let static middleware handle it
- Test permissions: `docker exec container ls -la /app/favicon.svg` should show readable permissions

This approach is simple, follows Docker best practices, and works with non-root users.