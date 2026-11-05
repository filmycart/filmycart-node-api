
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./docs/openapi');
const errors = require('./middleware/errors');

const app = express();

// Trust proxy (Nginx)
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS configuration
app.use(
    cors({
        origin: (process.env.FRONTEND_URL || 'http://localhost:3000')
            .split(',')
            .map(x => x.trim()),
        credentials: true
    })
);

// Response compression
app.use(compression());

// HTTP request logging
app.use(
    morgan(
        process.env.NODE_ENV === 'production'
            ? 'combined'
            : 'dev'
    )
);

// Razorpay webhook must receive the unmodified raw request body
// for signature validation.
app.post(
    '/api/v1/payments/razorpay/webhook',
    express.raw({ type: 'application/json' }),
    require('./controllers/payments').webhook
);

// Request body parsing
app.use(express.json({ limit: '1mb' }));
app.use(
    express.urlencoded({
        extended: true,
        limit: '1mb'
    })
);

// API rate limiting
app.use(
    '/api/',
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 300,
        standardHeaders: true,
        legacyHeaders: false
    })
);

// Swagger API documentation
app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(openapi)
);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        service: 'Filmycart API',
        status: 'ok'
    });
});

// API routes
app.use('/api/v1', routes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use(errors);

module.exports = app;
