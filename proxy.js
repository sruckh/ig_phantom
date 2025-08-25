require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const JobDatabase = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
const jobDB = new JobDatabase();
jobDB.initialize().catch(err => {
    console.error('❌ Database initialization failed:', err);
    process.exit(1);
});

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

// =============================================================================
// ASYNC JOB API ENDPOINTS
// =============================================================================

// 1. Start scraping job (async)
app.post('/api/start-scrape', async (req, res) => {
    console.log('🚀 Async scrape request received at:', new Date().toISOString());
    console.log('📦 Payload:', JSON.stringify(req.body, null, 2));
    
    try {
        const { url, sessionCookie } = req.body;
        
        // Validate input
        if (!url || !url.includes('instagram.com')) {
            return res.status(400).json({
                error: 'Valid Instagram URL is required'
            });
        }
        
        // Generate unique job ID
        const jobId = uuidv4();
        console.log('🆔 Generated job ID:', jobId);
        
        // Create job in database
        await jobDB.createJob(jobId, url, sessionCookie);
        
        // Start async N8N processing (fire and forget)
        startN8NProcessing(jobId, url, sessionCookie).catch(err => {
            console.error('❌ N8N processing failed for job:', jobId, err.message);
            jobDB.completeJob(jobId, null, err.message);
        });
        
        // Return job ID immediately
        res.json({
            jobId,
            status: 'processing',
            message: 'Scraping job started. Use /api/job-status/{jobId} to check progress.'
        });
        
        console.log('✅ Job started successfully:', jobId);
        
    } catch (error) {
        console.error('❌ Start scrape error:', error.message);
        res.status(500).json({
            error: 'Failed to start scraping job',
            details: error.message
        });
    }
});

// 2. Check job status
app.get('/api/job-status/:jobId', async (req, res) => {
    const { jobId } = req.params;
    console.log('🔍 Status check for job:', jobId);
    
    try {
        const job = await jobDB.getJob(jobId);
        
        if (!job) {
            return res.status(404).json({
                error: 'Job not found',
                jobId
            });
        }
        
        const response = {
            jobId: job.id,
            status: job.status,
            url: job.url,
            createdAt: job.created_at,
            completedAt: job.completed_at
        };
        
        // Include results if job is completed
        if (job.status === 'completed' && job.results) {
            response.results = job.results;
            response.totalImages = job.results.imageUrls ? job.results.imageUrls.length : 0;
        }
        
        // Include error if job failed
        if (job.status === 'failed' && job.error_message) {
            response.error = job.error_message;
        }
        
        res.json(response);
        console.log('📊 Status returned for job:', jobId, '- Status:', job.status);
        
    } catch (error) {
        console.error('❌ Status check error:', error.message);
        res.status(500).json({
            error: 'Failed to check job status',
            details: error.message
        });
    }
});

// 3. N8N callback endpoint (webhook)
app.post('/api/scrape-complete', async (req, res) => {
    console.log('📥 N8N callback received at:', new Date().toISOString());
    console.log('📦 Callback payload:', JSON.stringify(req.body, null, 2));
    
    try {
        let { jobId, success, imageUrls, totalImages, error } = req.body;
        
        // Fix N8N's = prefix issue and parse values correctly
        if (jobId && typeof jobId === 'string' && jobId.startsWith('=')) {
            jobId = jobId.substring(1); // Remove = prefix
        }
        
        if (success && typeof success === 'string') {
            if (success.startsWith('=')) {
                success = success.substring(1); // Remove = prefix
            }
            success = success === 'true'; // Convert string to boolean
        }
        
        if (imageUrls && typeof imageUrls === 'string') {
            if (imageUrls.startsWith('=')) {
                imageUrls = imageUrls.substring(1); // Remove = prefix
            }
            // Split comma-separated string into array
            imageUrls = imageUrls.split(',').map(url => url.trim()).filter(url => url.length > 0);
        }
        
        if (!jobId) {
            return res.status(400).json({
                error: 'Job ID is required'
            });
        }
        
        console.log('🔧 Parsed values:', { jobId, success, imageCount: imageUrls ? imageUrls.length : 0 });
        
        // Update job in database
        if (success && imageUrls && imageUrls.length > 0) {
            const results = {
                success: true,
                imageUrls,
                totalImages: totalImages || imageUrls.length,
                timestamp: new Date().toISOString()
            };
            
            await jobDB.completeJob(jobId, results);
            console.log('✅ Job completed successfully:', jobId, '- Images:', imageUrls.length);
            
        } else {
            await jobDB.completeJob(jobId, null, error || 'Unknown error from N8N');
            console.log('❌ Job failed:', jobId, '- Error:', error);
        }
        
        res.json({ 
            status: 'received',
            jobId,
            message: 'Callback processed successfully'
        });
        
    } catch (error) {
        console.error('❌ Callback processing error:', error.message);
        res.status(500).json({
            error: 'Failed to process callback',
            details: error.message
        });
    }
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Start N8N processing asynchronously
async function startN8NProcessing(jobId, url, sessionCookie) {
    console.log('🎯 Starting N8N processing for job:', jobId);
    
    try {
        const fetch = (await import('node-fetch')).default;
        
        // Prepare payload with callback URL
        const callbackUrl = process.env.CALLBACK_BASE_URL || `http://localhost:${PORT}`;
        const fullPayload = {
            jobId,
            url,
            sessionCookie: sessionCookie || '',
            phantomApiKey: process.env.PHANTOMBUSTER_API_KEY,
            agentId: process.env.AGENT_ID,
            csvName: 'instagram_scrape_results',
            numberOfPostsPerProfile: 100,
            numberOfProfilesPerLaunch: 1,
            callbackUrl: `${callbackUrl}/api/scrape-complete`
        };
        
        console.log('📡 Sending to N8N:', JSON.stringify(fullPayload, null, 2));
        
        // Note: This will timeout but we don't care since we have async callback
        const response = await fetch('https://n8n.gemneye.info/webhook/instagram-scraper', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(fullPayload),
            // Short timeout since we expect N8N to callback
            timeout: 10000
        });
        
        console.log('📊 N8N initial response:', response.status);
        
    } catch (error) {
        // This is expected to timeout - N8N will callback when done
        if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
            console.log('⏱️ N8N request timed out as expected - waiting for callback');
            return;
        }
        
        console.error('❌ N8N request failed:', error.message);
        throw error;
    }
}

// Catch-all route to serve index.html for any unmatched routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Proxy server running on port ${PORT}`);
    console.log(`📡 Proxying N8N requests to avoid CORS issues`);
    console.log(`🌐 Frontend should use: /api/webhook/instagram-scraper`);
});