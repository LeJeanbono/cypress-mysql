/// <reference types="cypress" />

import { Table } from "../models";
import { MysqlTask } from "../tasks";

declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            mysqlSelectAll<T>(options: Table): Chainable<[T]>
        }
    }
}

Cypress.Commands.add(MysqlTask.SELECT_ALL, (options: Table) => {
    return cy.task(MysqlTask.SELECT_ALL, options)
});

export { }