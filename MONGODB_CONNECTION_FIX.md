# MongoDB Connection Limit Fix Guide

## Problem
Your MongoDB Atlas M0 cluster is hitting the connection limit (500 connections max). This happens when:
- Multiple Node.js processes are running simultaneously
- Connections are not being properly closed
- Connection pooling is not optimized for serverless environments

## Immediate Solution

### 1. Stop All Running Node.js Processes
```powershell
# Kill all Node.js processes
npm run kill-processes

# Or manually:
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### 2. Check MongoDB Connection Status
```bash
npm run check-connections
```

### 3. Start Server Safely
```bash
# This will clean up connections before starting
npm run safe-start
```

## What Was Fixed

### 1. Optimized Connection Settings
- **Reduced maxPoolSize**: From 10 to 5 (suitable for M0 cluster)
- **Added maxIdleTimeMS**: Closes idle connections after 30 seconds
- **Reduced timeouts**: Faster failure detection
- **Connection reuse**: Reuses existing healthy connections

### 2. Added Connection Middleware
- Ensures database connection before each API request
- Handles connection failures gracefully
- Returns proper error responses when database is unavailable

### 3. Removed Startup Connection
- Connections are now established on-demand
- Better for serverless environments like Vercel

## Connection Management Scripts

### Check Connection Status
```bash
npm run check-connections
```
Shows current connections, available connections, and collections.

### Clean Up Connections
```bash
npm run cleanup-connections
```
Forcefully closes all Mongoose connections.

### Safe Restart
```bash
npm run restart
```
Kills processes, cleans connections, and starts fresh.

## Best Practices Going Forward

### 1. Development
- Use `npm run safe-start` instead of `npm start`
- Don't run multiple dev servers simultaneously
- Always stop the server properly (Ctrl+C)

### 2. Production (Vercel)
- The serverless setup automatically manages connections
- Each function invocation gets a fresh connection
- Connections are cleaned up after function execution

### 3. Monitoring
- Check connection status regularly: `npm run check-connections`
- Monitor your MongoDB Atlas dashboard for connection metrics

## Environment Variables Check

Make sure your `.env` file has:
```
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fems?retryWrites=true&w=majority
```

## Troubleshooting

### If you still get connection errors:
1. Wait 5-10 minutes for existing connections to timeout
2. Check MongoDB Atlas dashboard for active connections
3. Restart your MongoDB cluster if necessary (Atlas dashboard)
4. Verify your connection string is correct

### If multiple processes keep starting:
1. Check for any PM2 or other process managers
2. Make sure nodemon isn't creating multiple instances
3. Use `npm run kill-processes` to force stop all

## Connection Monitoring

Your server now includes these endpoints:
- `/health` - Shows server and database status
- `/test-db` - Tests database connection and lists collections
- `/debug-env` - Shows environment variable status

## Emergency Reset

If nothing else works:
1. Stop all Node.js processes: `npm run kill-processes`
2. Restart your MongoDB cluster in Atlas dashboard
3. Wait 2-3 minutes
4. Start fresh: `npm run safe-start`
