export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Sarf LYD rates API",
    version: "1.0.0",
    summary: "Latest and historical Libyan dinar rates against major currencies.",
    description:
      "Quotes are dinars per 1 unit of the foreign currency. Official rows come from HMRC (Open Government Licence) and U.S. Treasury Fiscal Data. Parallel rows from the sample provider are synthetic and labeled isSample=true. The Central Bank of Libya fixing is not scraped; record it with the manual endpoint when you are allowed to.",
    license: { name: "MIT", identifier: "MIT" },
  },
  servers: [{ url: "/", description: "This deployment" }],
  tags: [
    { name: "Rates" },
    { name: "Meta" },
    { name: "Admin" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer" },
    },
    schemas: {
      Error: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: { type: "string", examples: ["invalid_query"] },
              message: { type: "string" },
            },
          },
        },
      },
      Rate: {
        type: "object",
        required: ["currency", "kind", "provider", "date", "lydPerUnit", "unitPerLyd", "isSample", "isDerived"],
        properties: {
          currency: { type: "string", enum: ["USD", "EUR", "GBP", "TRY", "EGP", "TND"] },
          kind: { type: "string", enum: ["official", "parallel"] },
          provider: { type: "string", enum: ["hmrc", "treasury", "cbl-feed", "manual", "sample"] },
          date: { type: "string", format: "date" },
          lydPerUnit: { type: "string", examples: ["6.353077"] },
          unitPerLyd: { type: "string" },
          quoteConvention: { type: "string", const: "lyd_per_1_unit" },
          isSample: { type: "boolean" },
          isDerived: { type: "boolean" },
          note: { type: "string", nullable: true },
          licence: { type: "string", nullable: true },
          licenceUrl: { type: "string", nullable: true },
          sourceUrl: { type: "string", nullable: true },
        },
      },
    },
  },
  paths: {
    "/api/v1/health": {
      get: {
        tags: ["Meta"],
        operationId: "health",
        summary: "Service and database health",
        responses: { "200": { description: "Database responded." }, "503": { description: "Database is unreachable." } },
      },
    },
    "/api/v1/currencies": {
      get: {
        tags: ["Meta"],
        operationId: "listCurrencies",
        summary: "Currencies quoted against the dinar",
        responses: { "200": { description: "Currency list." } },
      },
    },
    "/api/v1/sources": {
      get: {
        tags: ["Meta"],
        operationId: "listSources",
        summary: "Providers, licences, and the sources this API refuses to scrape",
        responses: { "200": { description: "Source catalogue." } },
      },
    },
    "/api/v1/rates/latest": {
      get: {
        tags: ["Rates"],
        operationId: "latestRates",
        summary: "Latest stored rate for each currency and kind",
        parameters: [
          { name: "currency", in: "query", schema: { type: "string", enum: ["USD", "EUR", "GBP", "TRY", "EGP", "TND"] } },
          { name: "kind", in: "query", schema: { type: "string", enum: ["official", "parallel"] } },
          {
            name: "provider",
            in: "query",
            schema: { type: "string", enum: ["hmrc", "treasury", "cbl-feed", "manual", "sample"] },
          },
        ],
        responses: {
          "200": { description: "Latest rates." },
          "400": { description: "Invalid query.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/v1/rates/history": {
      get: {
        tags: ["Rates"],
        operationId: "rateHistory",
        summary: "Historical rates for one currency",
        parameters: [
          { name: "currency", in: "query", required: true, schema: { type: "string", enum: ["USD", "EUR", "GBP", "TRY", "EGP", "TND"] } },
          { name: "kind", in: "query", schema: { type: "string", enum: ["official", "parallel"], default: "official" } },
          { name: "provider", in: "query", schema: { type: "string" } },
          { name: "from", in: "query", schema: { type: "string", format: "date" } },
          { name: "to", in: "query", schema: { type: "string", format: "date" } },
        ],
        responses: {
          "200": { description: "Historical rows, oldest first." },
          "400": { description: "Invalid query." },
        },
      },
    },
    "/api/v1/rates/compare": {
      get: {
        tags: ["Rates"],
        operationId: "compareRates",
        summary: "Align an official series with a parallel series and compute the premium",
        parameters: [
          { name: "currency", in: "query", schema: { type: "string", default: "USD" } },
          { name: "officialProvider", in: "query", schema: { type: "string", default: "hmrc" } },
          { name: "parallelProvider", in: "query", schema: { type: "string", default: "sample" } },
          { name: "from", in: "query", schema: { type: "string", format: "date" } },
          { name: "to", in: "query", schema: { type: "string", format: "date" } },
        ],
        responses: { "200": { description: "Aligned points and spreads." }, "400": { description: "Invalid query." } },
      },
    },
    "/api/admin/rates": {
      post: {
        tags: ["Admin"],
        operationId: "createManualRate",
        summary: "Record a manual official or parallel rate",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["currency", "date", "kind", "lydPerUnit"],
                properties: {
                  currency: { type: "string", enum: ["USD", "EUR", "GBP", "TRY", "EGP", "TND"] },
                  date: { type: "string", format: "date" },
                  kind: { type: "string", enum: ["official", "parallel"] },
                  lydPerUnit: { oneOf: [{ type: "string" }, { type: "number" }] },
                  note: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Stored." }, "401": { description: "Missing or wrong bearer token." } },
      },
    },
    "/api/cron/ingest": {
      get: {
        tags: ["Admin"],
        operationId: "ingest",
        summary: "Run the scheduled ingestion job",
        description:
          "When INGEST_LIVE=true, fetches HMRC and Treasury. Always regenerates the labeled parallel sample from stored HMRC rows. Requires CRON_SECRET outside demo mode.",
        responses: { "200": { description: "Ingestion report." }, "401": { description: "Unauthorized." } },
      },
    },
    "/api/openapi.json": {
      get: {
        tags: ["Meta"],
        operationId: "openApi",
        summary: "This document",
        responses: { "200": { description: "OpenAPI 3.1 document." } },
      },
    },
  },
} as const;
