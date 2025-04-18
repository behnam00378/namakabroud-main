const concurrently = require('concurrently');
const path = require('path');

console.log('🚀 Starting Guard Management System...');

// Run both backend and frontend concurrently
concurrently([
  { 
    command: 'npm run start-backend', 
    name: 'backend', 
    prefixColor: 'blue'
  },
  { 
    command: 'npm run start-frontend', 
    name: 'frontend', 
    prefixColor: 'green'
  }
], {
  prefix: 'name',
  timestampFormat: 'HH:mm:ss',
  killOthers: ['failure', 'success'],
  shell: true
}); 