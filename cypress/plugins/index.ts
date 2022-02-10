/// <reference types="cypress" />
const cypressMysql = require('../../dist');

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = async (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  cypressMysql.plugin(config, on, { debug: true, mysqlOptions: { timezone: 'UTC' } })
  return config;
}
