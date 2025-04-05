// swagger.js
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Aptitude Exam API",
      version: "1.0.0",
      description: "API documentation for exam system",
    },
    servers: [
      {
        url: "http://localhost:5050", // your base URL
      },
    ],
  },
  apis: ["./routes/*.js","./controllers/*.js"], // path to your route files
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = { swaggerUi, swaggerSpec };
