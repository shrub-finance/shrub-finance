import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      baseUrl: "http://localhost:3000/",
    },
    experimentalSessionAndOrigin: true,
    chromeWebSecurity: false,
  },
});
