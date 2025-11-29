
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'User Management API',
            version: '1.0.0'
        },
        servers: [{ url: process.env.BASE_URL || 'http://localhost:3000' }]
    },
    apis: ['./routes/*.js', './controllers/*.js']
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
