import swaggerJSDoc, { Options } from "swagger-jsdoc";

const options: Options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "ESN HR App API",
      version: "1.0.0",
      description: "API documentation for ESN HR App using Scalar",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local dev server",
      },
    ],
  },

  // Scan TypeScript route files for OpenAPI JSDoc
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;