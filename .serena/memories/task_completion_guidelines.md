# Task Completion Guidelines

## When a Development Task is Completed

### 1. Code Validation
Since this project has no automated linting/testing, manual validation is required:

**HTML Validation**:
```bash
# Check HTML syntax manually or use online validators
# Verify proper closing tags, semantic structure
# Ensure accessibility attributes are present
```

**JavaScript Validation**:
```bash
# Check for JavaScript syntax errors in browser console
# Verify async/await patterns are correct
# Test error handling paths
```

### 2. Docker Build Testing
```bash
# Always rebuild and test after code changes
docker-compose down
docker-compose up --build

# Verify container starts successfully
docker-compose logs -f frontend

# Check environment variable substitution worked
docker exec -it instagram_scraper_ui cat /usr/share/nginx/html/index.html | grep -E "(N8N_WEBHOOK_URL|PHANTOM_API_KEY|AGENT_ID)"
```

### 3. Functional Testing
**Manual Testing Checklist**:
- [ ] Application loads without JavaScript errors
- [ ] Form validation works for empty/invalid URLs
- [ ] Configuration validation displays appropriate errors
- [ ] UI responds correctly to loading states
- [ ] Image grid displays properly after successful scraping
- [ ] Image selection/deselection works
- [ ] ZIP download functionality works
- [ ] Responsive design works on mobile devices

### 4. Integration Testing
```bash
# Test with actual N8N webhook (if available)
# Verify PhantomBuster integration works
# Check that environment variables are properly configured
```

### 5. Security Validation
- [ ] No API keys hardcoded in HTML (should be placeholders)
- [ ] Environment variables properly substituted at runtime
- [ ] Input validation prevents XSS
- [ ] No sensitive data logged to console

### 6. Performance Checks
- [ ] CSS and JavaScript are minified (if changed)
- [ ] Image loading is efficient
- [ ] No memory leaks in JavaScript
- [ ] Container size is reasonable

### 7. Documentation Updates
If changes affect:
- **API integration**: Update environment variable documentation
- **UI/UX**: Update user instructions
- **Docker setup**: Update deployment instructions
- **Dependencies**: Update technology stack documentation

### 8. Deployment Verification
```bash
# Final deployment test
docker-compose down
docker-compose up -d

# Verify service is accessible
curl -I http://localhost:8080  # or appropriate port

# Check service health
docker-compose ps
```

## No Automated Quality Gates
**Important**: This project lacks:
- ❌ Automated linting (ESLint)
- ❌ Code formatting (Prettier)
- ❌ Unit/integration tests
- ❌ Build processes (npm scripts)
- ❌ CI/CD pipelines

All quality assurance must be done manually through:
- Manual code review
- Browser testing
- Docker build verification
- Integration testing with external services