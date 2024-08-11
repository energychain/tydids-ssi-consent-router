const Openapi = require("moleculer-auto-openapi");

module.exports = {
  name: 'openapi',
  mixins: [Openapi],
  settings: {
    // all setting optional
    openapi: {
      info: {
        // about project
        description: "A lightweight microservice designed to simplify Self-Sovereign Identity (SSI) based consent management in web applications. It acts as a secure intermediary between web forms and backend systems, ensuring compliance with data privacy regulations like GDPR.",
        title: "tydids-ssi-consent-router",
      },
      tags: [
        // you tags
        { name: "auth", description: "STROMDAO GmbH <dev@stromdao.com>" },
      ],
      components: {
        // you auth
        securitySchemes: {
          myBasicAuth: {
            type: 'http',
            scheme: 'basic',
          },
        },
      },
    },
  },
}