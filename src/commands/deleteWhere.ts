/// <reference types="cypress" />

import { DeleteWhere } from "../models";
import { MysqlTask } from "../tasks";

declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            mysqlDeleteWhere(options: DeleteWhere): Chainable<number>
        }
    }
}

Cypress.Commands.add(MysqlTask.DELETE_WHERE, (options: DeleteWhere) => {
    return cy.task(MysqlTask.DELETE_WHERE, options)
});

export { };

