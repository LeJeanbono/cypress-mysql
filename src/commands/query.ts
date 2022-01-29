/// <reference types="cypress" />

import { MysqlTask } from "../tasks";

declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            mysqlQuery<T>(query: string): Chainable<[T]>
        }
    }
}

Cypress.Commands.add(MysqlTask.QUERY, (query: string) => {
    return cy.task(MysqlTask.QUERY, query)
});

export { }