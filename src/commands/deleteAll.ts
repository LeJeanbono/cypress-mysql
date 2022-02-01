/// <reference types="cypress" />

import { Table } from "../models";
import { MysqlTask } from "../tasks";

declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            mysqlDeleteAll(options: Table): Chainable<number>
        }
    }
}

Cypress.Commands.add(MysqlTask.DELETE_ALL, (options: Table) => {
    return cy.task(MysqlTask.DELETE_ALL, options)
});

export { };
