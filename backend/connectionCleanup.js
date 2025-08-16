#!/usr/bin/env node

/**
 * MongoDB Connection Cleanup Utility
 * This script helps manage and monitor MongoDB connections
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function checkConnections() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI not found in environment variables');
      process.exit(1);
    }

    console.log('Connecting to MongoDB to check connection status...');
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 1, // Use minimal connections for this check
    });

    console.log('✅ Successfully connected to MongoDB');
    
    // Get database stats
    const admin = mongoose.connection.db.admin();
    const stats = await admin.serverStatus();
    
    console.log('\n📊 Connection Statistics:');
    console.log(`- Current connections: ${stats.connections.current}`);
    console.log(`- Available connections: ${stats.connections.available}`);
    console.log(`- Total created: ${stats.connections.totalCreated}`);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Available Collections:');
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    await mongoose.connection.close();
    console.log('\n✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ Connection check failed:', error.message);
    process.exit(1);
  }
}

async function forceCloseConnections() {
  try {
    console.log('Forcing close of all Mongoose connections...');
    await mongoose.disconnect();
    console.log('✅ All connections closed');
  } catch (error) {
    console.error('❌ Error closing connections:', error.message);
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'check':
    checkConnections();
    break;
  case 'close':
    forceCloseConnections();
    break;
  default:
    console.log('MongoDB Connection Cleanup Utility');
    console.log('Usage:');
    console.log('  node connectionCleanup.js check  - Check connection status');
    console.log('  node connectionCleanup.js close  - Force close all connections');
    break;
}
