#!/bin/sh

# Substitute environment variables in index.html
envsubst '$N8N_WEBHOOK_URL $PHANTOMBUSTER_API_KEY $AGENT_ID' < /usr/share/nginx/html/index.html > /usr/share/nginx/html/index.html.tmp
mv /usr/share/nginx/html/index.html.tmp /usr/share/nginx/html/index.html

echo "Environment variables substituted in index.html"