/// <reference types="cypress" />

import { Table } from "../models";
import { MysqlTask } from "../tasks";

declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            mysqlDeleteAll<T>(options: Table): Chainable<[T]>
        }
    }
}

Cypress.Commands.add(MysqlTask.DELETE_ALL, (options: Table) => {
    return cy.task(MysqlTask.DELETE_ALL, options)
});

export { };
