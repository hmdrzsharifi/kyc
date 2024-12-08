const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0', // نسخه OpenAPI
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'API documentation for your application',
        },
        components: {
            securitySchemes: {
                OAuth2: {
                    type: 'oauth2',
                    flows: {
                        clientCredentials: {
                            tokenUrl: 'http://saramad.dev.modernisc.com:6060/realms/platform/protocol/openid-connect/token', // URL دریافت توکن از Keycloak
                            scopes: {
                                'admin': 'Admin Access',
                                'user': 'User Access',
                            },
                        },
                    },
                },
            },
        },
        security: [
            {
                OAuth2: ['admin', 'user'],
            },
        ],
    },
    apis: ['./routes/*.js'], // مسیرهای API که می‌خواهید مستندات آن‌ها ایجاد شود
};

// ایجاد Swagger specs
const swaggerDocs = swaggerJSDoc(swaggerOptions);

module.exports = {
    swaggerDocs,
    swaggerUi,
};
