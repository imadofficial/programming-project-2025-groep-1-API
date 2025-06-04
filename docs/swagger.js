const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.1.0',
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'Demo Express API documented with OpenAPI 3.1 & Swagger UI',
  },
  servers: [{ url: 'http://localhost:3001', description: 'Dev server' }],
};

const options = {
  definition: swaggerDefinition,
  // Globs to every file that contains JSDoc @openapi blocks:
  apis: ['./routes/**/*.js', './models/**/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`📚  Swagger docs available at http://localhost:3001/docs`);
};

module.exports = swaggerDocs;