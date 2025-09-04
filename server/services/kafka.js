const config = require('../config/env');

let kafka = null;
let producer = null;
let isConnected = false;

async function init() {
  if (!config.kafka.brokers || config.kafka.brokers.length === 0) {
    console.log('ℹ️ Kafka not configured; skipping Kafka init');
    return null;
  }
  try {
    const { Kafka } = require('kafkajs');
    kafka = new Kafka({
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
      ssl: config.kafka.ssl || undefined,
      sasl: config.kafka.sasl || undefined
    });
    producer = kafka.producer();
    await producer.connect();
    isConnected = true;
    console.log('✅ Kafka producer connected');
    return producer;
  } catch (err) {
    console.warn('⚠️ Kafka init failed:', err.message);
    kafka = null; producer = null; isConnected = false;
    return null;
  }
}

function ready() { return isConnected; }

async function publish(topic, message) {
  if (!producer) return false;
  try {
    await producer.send({ topic, messages: [{ value: JSON.stringify(message) }] });
    return true;
  } catch (err) {
    console.warn('Kafka publish failed:', err.message);
    return false;
  }
}

module.exports = { init, publish, ready };
