const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers (Google & Cloudflare) to prevent ISP/local router DNS resolution failures
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // If restricted, continue with default DNS
}

// Custom lookup function that resolves MongoDB hostnames using configured DNS servers
const customLookup = (hostname, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  dns.resolve4(hostname, (err, addresses) => {
    if (err || !addresses || addresses.length === 0) {
      return dns.lookup(hostname, options, callback);
    }
    if (options && options.all) {
      return callback(
        null,
        addresses.map((address) => ({ address, family: 4 }))
      );
    }
    return callback(null, addresses[0], 4);
  });
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      lookup: customLookup,
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection Error: ${error.message}`);
    console.error(
      '[MongoDB] Ensure your MongoDB Atlas cluster is running and your IP is whitelisted (0.0.0.0/0).'
    );
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
