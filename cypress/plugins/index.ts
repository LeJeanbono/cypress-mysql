/// <reference types="cypress" />
const { mysqlTasks } = require('LeJeanbono/cypress-mysql');

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = async (on: Cypress.PluginEvents, config: Cypress.PluginConfig) => {
  on('task', {
    ...mysqlTasks(config, { debug: true })
  })
}
