const express = require('express');
const httpProxy = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const Redis = require('redis');
const { createProxyMiddleware } = require('http-proxy-middleware');
const consul = require('consul')();
require('dotenv').config();

const app = express();
const redis = Redis.createClient(process.env.REDIS_URL);

// Service Registry - Real service discovery
const services = {
  auth: {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    healthCheck: '/health'
  },
  user: {
    url: process.env.USER_SERVICE_URL || 'http://localhost:3002',
    healthCheck: '/health'
  },
  room: {
    url: process.env.ROOM_SERVICE_URL || 'http://localhost:3003',
    healthCheck: '/health'
  },
  message: {
    url: process.env.MESSAGE_SERVICE_URL || 'http://localhost:3004',
    healthCheck: '/health'
  },
  file: {
    url: process.env.FILE_SERVICE_URL || 'http://localhost:3005',
    healthCheck: '/health'
  },
  notification: {
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006',
    healthCheck: '/health'
  },
  underground: {
    url: process.env.UNDERGROUND_SERVICE_URL || 'http://localhost:3007',
    healthCheck: '/health'
  }
};

// Security Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:", "https:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "blob:"],
      frameSrc: ["'none'"],
    },
  },
}));

// CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'https://7f9f07ec90e14c4eb9786c1a581ba4c2-d013ba103e97449584c25fa43.fly.dev',
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-room-code', 'x-encryption-key', 'x-client-id']
}));

// Rate Limiting with Redis
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: async (req) => {
    // Different limits based on authentication status
    if (req.headers.authorization) {
      return 1000; // Higher limit for authenticated users
    }
    return 100; // Lower limit for anonymous users
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new (require('express-rate-limit').MemoryStore)(),
  keyGenerator: (req) => {
    return req.ip + ':' + (req.headers.authorization || 'anonymous');
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000)
    });
  }
});

app.use(rateLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'NO_TOKEN' 
    });
  }

  try {
    // Verify token with Auth Service
    const response = await fetch(`${services.auth.url}/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Token verification failed');
    }

    const userData = await response.json();
    req.user = userData.user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ 
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN' 
    });
  }
};

// Service Health Monitoring
const healthCheck = async (serviceName, serviceConfig) => {
  try {
    const response = await fetch(`${serviceConfig.url}${serviceConfig.healthCheck}`, {
      method: 'GET',
      timeout: 5000
    });
    
    return {
      service: serviceName,
      status: response.ok ? 'healthy' : 'unhealthy',
      url: serviceConfig.url,
      responseTime: Date.now(),
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      service: serviceName,
      status: 'unhealthy',
      url: serviceConfig.url,
      error: error.message,
      lastChecked: new Date().toISOString()
    };
  }
};

// Load Balancer for multiple service instances
const loadBalancer = {
  instances: new Map(),
  
  addInstance(serviceName, instanceUrl) {
    if (!this.instances.has(serviceName)) {
      this.instances.set(serviceName, []);
    }
    this.instances.get(serviceName).push({
      url: instanceUrl,
      healthy: true,
      lastCheck: Date.now()
    });
  },
  
  getHealthyInstance(serviceName) {
    const instances = this.instances.get(serviceName) || [];
    const healthyInstances = instances.filter(instance => instance.healthy);
    
    if (healthyInstances.length === 0) {
      return services[serviceName]?.url; // Fallback to default
    }
    
    // Round-robin selection
    const selected = healthyInstances[Math.floor(Math.random() * healthyInstances.length)];
    return selected.url;
  }
};

// Circuit Breaker Pattern
class CircuitBreaker {
  constructor(serviceName, options = {}) {
    this.serviceName = serviceName;
    this.failureThreshold = options.failureThreshold || 5;
    this.recoveryTimeout = options.recoveryTimeout || 60000;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
  }

  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error(`Circuit breaker is OPEN for ${this.serviceName}`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}

// Create circuit breakers for each service
const circuitBreakers = {};
Object.keys(services).forEach(serviceName => {
  circuitBreakers[serviceName] = new CircuitBreaker(serviceName);
});

// Proxy Configuration with Circuit Breaker
const createServiceProxy = (serviceName, pathPrefix) => {
  return createProxyMiddleware({
    target: services[serviceName].url,
    changeOrigin: true,
    pathRewrite: {
      [`^${pathPrefix}`]: ''
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add service-specific headers
      proxyReq.setHeader('X-Gateway-Service', serviceName);
      proxyReq.setHeader('X-Request-ID', req.headers['x-request-id'] || generateRequestId());
      proxyReq.setHeader('X-Client-IP', req.ip);
      
      // Forward user context
      if (req.user) {
        proxyReq.setHeader('X-User-ID', req.user.userId);
        proxyReq.setHeader('X-User-Role', req.user.role || 'user');
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // Add response headers
      proxyRes.headers['X-Service'] = serviceName;
      proxyRes.headers['X-Response-Time'] = Date.now() - req.startTime;
    },
    onError: (err, req, res) => {
      console.error(`Proxy error for ${serviceName}:`, err);
      res.status(503).json({
        error: 'Service temporarily unavailable',
        service: serviceName,
        code: 'SERVICE_ERROR'
      });
    }
  });
};

// Request ID Generator
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Request Middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  req.requestId = req.headers['x-request-id'] || generateRequestId();
  res.setHeader('X-Request-ID', req.requestId);
  next();
});

// API Routes with Authentication

// Public routes (no authentication required)
app.use('/api/auth', createServiceProxy('auth', '/api/auth'));
app.use('/api/health', createServiceProxy('auth', '/api/health'));

// Protected routes (authentication required)
app.use('/api/users', authenticateToken, createServiceProxy('user', '/api/users'));
app.use('/api/rooms', authenticateToken, createServiceProxy('room', '/api/rooms'));
app.use('/api/messages', authenticateToken, createServiceProxy('message', '/api/messages'));
app.use('/api/files', authenticateToken, createServiceProxy('file', '/api/files'));
app.use('/api/notifications', authenticateToken, createServiceProxy('notification', '/api/notifications'));
app.use('/api/underground', authenticateToken, createServiceProxy('underground', '/api/underground'));

// WebSocket Proxy for real-time features
const { createProxyMiddleware: wsProxy } = require('http-proxy-middleware');

app.use('/socket.io', wsProxy({
  target: services.notification.url,
  changeOrigin: true,
  ws: true,
  logLevel: 'debug'
}));

// Gateway Health Check
app.get('/health', async (req, res) => {
  const checks = await Promise.allSettled(
    Object.entries(services).map(([name, config]) => 
      healthCheck(name, config)
    )
  );

  const serviceHealth = checks.map(check => 
    check.status === 'fulfilled' ? check.value : {
      service: 'unknown',
      status: 'error',
      error: check.reason.message
    }
  );

  const allHealthy = serviceHealth.every(service => service.status === 'healthy');

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: serviceHealth,
    gateway: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    }
  });
});

// API Documentation Endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    name: 'SecureChat API Gateway',
    version: '1.0.0',
    description: 'Microservices API Gateway for SecureChat Application',
    services: Object.keys(services),
    endpoints: {
      auth: [
        'POST /api/auth/anonymous',
        'POST /api/auth/register',
        'POST /api/auth/login',
        'POST /api/auth/refresh',
        'POST /api/auth/logout',
        'GET /api/auth/verify'
      ],
      users: [
        'GET /api/users/profile',
        'PUT /api/users/profile',
        'GET /api/users/stats',
        'PUT /api/users/preferences'
      ],
      rooms: [
        'POST /api/rooms/create',
        'POST /api/rooms/join',
        'GET /api/rooms/:roomCode',
        'PUT /api/rooms/:roomId/settings',
        'DELETE /api/rooms/:roomId'
      ],
      messages: [
        'GET /api/messages/:roomId',
        'POST /api/messages',
        'PUT /api/messages/:messageId',
        'DELETE /api/messages/:messageId'
      ],
      files: [
        'POST /api/files/upload',
        'GET /api/files/:fileId',
        'DELETE /api/files/:fileId'
      ],
      underground: [
        'POST /api/underground/onion-routing',
        'POST /api/underground/crypto-mixer',
        'POST /api/underground/steganography'
      ]
    }
  });
};

// Error Handler
app.use((error, req, res, next) => {
  console.error('Gateway Error:', error);
  
  res.status(error.status || 500).json({
    error: error.message || 'Internal gateway error',
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
    service: 'gateway'
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: '/api/docs'
  });
});

// Service Discovery and Health Monitoring
const startHealthMonitoring = () => {
  setInterval(async () => {
    const healthChecks = await Promise.allSettled(
      Object.entries(services).map(([name, config]) => 
        healthCheck(name, config)
      )
    );

    healthChecks.forEach((check, index) => {
      const serviceName = Object.keys(services)[index];
      const result = check.status === 'fulfilled' ? check.value : null;
      
      if (result && result.status === 'unhealthy') {
        console.warn(`⚠️ Service ${serviceName} is unhealthy`);
        
        // Circuit breaker logic
        circuitBreakers[serviceName].onFailure();
      } else if (result && result.status === 'healthy') {
        circuitBreakers[serviceName].onSuccess();
      }
    });
  }, 30000); // Check every 30 seconds
};

// Graceful Shutdown
const gracefulShutdown = () => {
  console.log('🔄 Gateway shutting down gracefully...');
  
  server.close(() => {
    console.log('✅ Gateway server closed');
    redis.quit();
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api/docs`);
  
  // Start health monitoring
  startHealthMonitoring();
});

module.exports = { app, server };