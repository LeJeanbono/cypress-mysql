import { defineConfig } from 'cypress'
import { plugin } from './src'

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
    setupNodeEvents(on, config) {
      plugin(on, config, { debug: true, mysqlOptions: { timezone: 'UTC' } })
      return config
    },
  },
})
