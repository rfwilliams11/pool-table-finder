// Import the compiled Express app
const app = require('../server/dist/index.js').default || require('../server/dist/index.js');

// Export as Vercel serverless function
module.exports = app;