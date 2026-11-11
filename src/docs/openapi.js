module.exports = { 
    openapi: '3.0.3', 
    info: { 
        title: 'Filmycart API', 
        version: '1.0.0' 
    }, 
    servers: [
        { url: '/api/v1' }
    ], 
    components: { 
        securitySchemes: { 
            bearerAuth: { 
                type: 'http', 
                scheme: 'bearer', 
                bearerFormat: 'JWT' 
            } 
        } 
    }, 
    paths: {
        '/auth/register': { 
            post: { 
                summary: 'Register customer', 
                responses: { 
                    '201': { 
                        description: 'Created' 
                    } 
                } 
            } 
        }, 
        '/auth/login': { 
            post: { 
                summary: 'Login', 
                responses: { '200': { description: 'Authenticated' } } 
            } 
        },
        '/products': { 
            get: { 
                summary: 'Browse products', 
                responses: { '200': { description: 'Product list' }} 
            }, 
            post: {
                summary: 'Create product (admin)', 
                security: [{ bearerAuth: [] }], 
                responses: { '201': { description: 'Created' }} 
            }
        }, 
        '/categories': {
            get: { 
                summary: 'List categories', 
                responses: { '200': { description: 'Category list' } } 
            } 
        }, 
        '/cart': { 
            get: { 
                summary: 'Get cart', 
                security: [{ bearerAuth: [] }], 
                responses: { '200': { description: 'Cart' } } } 
        }, 
        '/orders/checkout': {
            post: { 
                summary: 'Checkout cart', 
                security: [{ bearerAuth: [] }], 
                responses: { '201': { description: 'Order created' } } } 
            },
        '/payments/razorpay/{orderId}': { 
            post: { 
                summary: 'Create Razorpay order', 
                security: [{ bearerAuth: [] }], 
                parameters: [{ in: 'path', name: 'orderId', required: true, 
                schema: { type: 'integer' } }], 
                responses: { '200': { description: 'Gateway order' } } 
            } 
        } 
    } 
};
