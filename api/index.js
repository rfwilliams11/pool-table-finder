// Vercel serverless function that imports our Express app
const app = require('../server/dist/index.js').default;

module.exports = app;