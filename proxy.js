require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors({
    origin: [
        'https://igphantom.gemneye.info',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ],
    credentials: true
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Serve static files from current directory
app.use(express.static('.', {
    // Set proper MIME type for SVG files
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.svg')) {
            res.setHeader('Content-Type', 'image/svg+xml');
        }
    }
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Favicon fallback for ICO requests (serve SVG as ICO)
app.get('/favicon.ico', (req, res) => {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.sendFile(path.join(__dirname, 'favicon.svg'), (err) => {
        if (err) {
            console.error('❌ Favicon ICO->SVG error:', err.message);
            res.status(404).send('Favicon not found');
        }
    });
});

// Proxy endpoint for N8N webhook
app.post('/api/webhook/instagram-scraper', async (req, res) => {
    console.log('🚀 Proxy received request at:', new Date().toISOString());
    console.log('📦 Payload:', JSON.stringify(req.body, null, 2));
    
    const startTime = Date.now();
    
    try {
        const fetch = (await import('node-fetch')).default;
        
        // Add environment variables to the payload before forwarding
        const fullPayload = {
            ...req.body,
            phantomApiKey: process.env.PHANTOMBUSTER_API_KEY,
            agentId: process.env.AGENT_ID
        };
        
        const response = await fetch('https://n8n.gemneye.info/webhook/instagram-scraper', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(fullPayload),
            // Increase timeout to 5 minutes for long-running scraping
            timeout: 300000
        });
        
        const responseTime = Date.now() - startTime;
        console.log('📡 N8N response received after:', responseTime, 'ms');
        console.log('📊 Response status:', response.status);
        
        if (!response.ok) {
            console.error('❌ N8N returned error:', response.status, response.statusText);
            return res.status(response.status).json({
                error: `N8N webhook failed: ${response.status} ${response.statusText}`
            });
        }
        
        const data = await response.text();
        console.log('📄 Response body length:', data.length);
        console.log('🔍 Response preview:', data.substring(0, 200));
        
        // Try to parse as JSON
        let jsonData;
        try {
            jsonData = JSON.parse(data);
            console.log('✅ JSON parsed successfully');
        } catch (parseError) {
            console.error('❌ JSON parse error:', parseError.message);
            return res.status(500).json({
                error: 'Failed to parse N8N response as JSON',
                raw_response: data.substring(0, 500)
            });
        }
        
        // Return the data with CORS headers
        res.json(jsonData);
        
        console.log('🏁 Total proxy time:', Date.now() - startTime, 'ms');
        
    } catch (error) {
        const errorTime = Date.now() - startTime;
        console.error('❌ Proxy error after:', errorTime, 'ms');
        console.error('🚨 Error:', error.message);
        
        // Handle timeout errors
        if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
            return res.status(504).json({
                error: 'N8N webhook timed out',
                timeout_duration: errorTime
            });
        }
        
        res.status(500).json({
            error: error.message,
            duration: errorTime
        });
    }
});

// Catch-all route to serve index.html for any unmatched routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Proxy server running on port ${PORT}`);
    console.log(`📡 Proxying N8N requests to avoid CORS issues`);
    console.log(`🌐 Frontend should use: /api/webhook/instagram-scraper`);
});