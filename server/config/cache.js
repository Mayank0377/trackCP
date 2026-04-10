const NodeCache = require('node-cache');

// TTL: 15 minutes (900 seconds)
const cache = new NodeCache({ stdTTL: 900, checkperiod: 120 });

module.exports = cache;
