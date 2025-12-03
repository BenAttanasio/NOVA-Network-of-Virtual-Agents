// ============================================
// CONFIGURATION TEMPLATE
// ============================================
// Copy this file to config.js and fill in your webhook URLs.
// config.js is gitignored and won't be committed.

window.APP_CONFIG = {
    // n8n webhook URL that fetches all agents from Notion
    WEBHOOK_FETCH_URL: 'YOUR_N8N_WEBHOOK_URL_HERE',
    
    // n8n webhook URL for updating agent data (optional)
    WEBHOOK_UPDATE_URL: 'YOUR_N8N_WEBHOOK_URL_HERE',
    
    // Refresh interval in milliseconds (0 = no auto-refresh)
    REFRESH_INTERVAL: 0,
};