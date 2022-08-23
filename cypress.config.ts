import { defineConfig } from 'cypress'

export default defineConfig({
  env: {
    MYSQL_HOST: 'localhost',
    MYSQL_PORT: '3307',
    MYSQL_DB: 'mydb',
    MYSQL_USER: 'root',
    MYSQL_PASSWORD: 'root',
  },
  video: false,
  screenshotOnRunFailure: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.ts')(on, config)
    },
  },
})
