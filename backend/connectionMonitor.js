#!/usr/bin/env node

/**
 * MongoDB Connection Monitor
 * Continuously monitors connection count and alerts when approaching limit
 */

const mongoose = require('mongoose');
require('dotenv').config();

const DANGER_THRESHOLD = 450; // Alert when approaching 500 connection limit
const WARNING_THRESHOLD = 350;

async function monitorConnections() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 1,
    });

    const admin = mongoose.connection.db.admin();
    const stats = await admin.serverStatus();
    
    const current = stats.connections.current;
    const available = stats.connections.available;
    const total = current + available;
    
    const timestamp = new Date().toISOString();
    
    let status = '✅ NORMAL';
    if (current >= DANGER_THRESHOLD) {
      status = '🚨 DANGER';
    } else if (current >= WARNING_THRESHOLD) {
      status = '⚠️  WARNING';
    }
    
    console.log(`[${timestamp}] ${status}`);
    console.log(`  Connections: ${current}/${total} (${((current/total)*100).toFixed(1)}%)`);
    console.log(`  Available: ${available}`);
    
    if (current >= WARNING_THRESHOLD) {
      console.log('');
      console.log('🔧 RECOMMENDED ACTIONS:');
      console.log('  1. Run: npm run kill-processes');
      console.log('  2. Run: npm run cleanup-connections');
      console.log('  3. Wait 2-3 minutes for connections to timeout');
    }
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Monitor failed:`, error.message);
  }
}

// Run once or continuously
const continuous = process.argv.includes('--continuous');

if (continuous) {
  console.log('Starting continuous monitoring (every 30 seconds)...');
  console.log('Press Ctrl+C to stop');
  
  monitorConnections(); // Run immediately
  setInterval(monitorConnections, 30000); // Then every 30 seconds
} else {
  monitorConnections();
}
