const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const concurrently = require('concurrently');

console.log('🚀 Starting Guard Management System...');

// Run both backend and frontend concurrently
concurrently([
  { 
    command: 'nodemon server.js', 
    name: 'backend', 
    prefixColor: 'blue',
    cwd: path.resolve(__dirname)
  },
  { 
    command: 'npm start', 
    name: 'frontend', 
    prefixColor: 'green',
    cwd: path.resolve(__dirname, 'frontend'),
    env: { PORT: '3002' } // Set frontend to run on port 3002
  }
], {
  prefix: 'name',
  timestampFormat: 'HH:mm:ss',
  killOthers: ['failure', 'success'],
}); 