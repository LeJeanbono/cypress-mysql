/// <reference types="cypress" />

import { MysqlTask } from "../tasks";

declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            mysqlDropTable(table: string): Chainable
        }
    }
}

Cypress.Commands.add(MysqlTask.DROP_TABLE, (table: string) => {
    return cy.task(MysqlTask.DROP_TABLE, table)
});

export { };
