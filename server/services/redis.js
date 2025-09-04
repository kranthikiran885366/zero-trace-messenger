const config = require('../config/env');

let client = null;
let pub = null;
let sub = null;

async function init() {
  if (!config.redisUrl) {
    console.log('ℹ️ Redis not configured; skipping Redis init');
    return null;
  }
  try {
    // Lazy require only when configured
    const { createClient } = require('redis');
    client = createClient({ url: config.redisUrl });
    pub = createClient({ url: config.redisUrl });
    sub = createClient({ url: config.redisUrl });

    client.on('error', (err) => console.warn('Redis client error:', err.message));
    pub.on('error', (err) => console.warn('Redis pub error:', err.message));
    sub.on('error', (err) => console.warn('Redis sub error:', err.message));

    await Promise.all([client.connect(), pub.connect(), sub.connect()]);
    console.log('✅ Redis connected');
    return client;
  } catch (err) {
    console.warn('⚠️ Redis init failed:', err.message);
    client = null; pub = null; sub = null;
    return null;
  }
}

function isReady() {
  return !!client;
}

async function set(key, value, ttlSec = null) {
  if (!client) return false;
  const v = typeof value === 'string' ? value : JSON.stringify(value);
  if (ttlSec) return client.set(key, v, { EX: ttlSec });
  return client.set(key, v);
}

async function get(key) {
  if (!client) return null;
  const v = await client.get(key);
  try { return JSON.parse(v); } catch { return v; }
}

async function publish(channel, message) {
  if (!pub) return 0;
  const payload = typeof message === 'string' ? message : JSON.stringify(message);
  return pub.publish(channel, payload);
}

async function subscribe(channel, handler) {
  if (!sub) return () => {};
  await sub.subscribe(channel, (payload) => {
    try { handler(JSON.parse(payload)); } catch { handler(payload); }
  });
  return async () => sub.unsubscribe(channel);
}

async function sadd(key, member) { if (!client) return 0; return client.sAdd(key, member); }
async function srem(key, member) { if (!client) return 0; return client.sRem(key, member); }
async function smembers(key) { if (!client) return []; return client.sMembers(key); }

module.exports = { init, isReady, set, get, publish, subscribe, sadd, srem, smembers };
