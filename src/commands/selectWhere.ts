/// <reference types="cypress" />

import { SelectWhere } from "../models";
import { MysqlTask } from "../tasks";

declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            mysqlSelectWhere<T>(options: SelectWhere): Chainable<[T]>
        }
    }
}

Cypress.Commands.add(MysqlTask.SELECT_WHERE, (options: SelectWhere) => {
    return cy.task(MysqlTask.SELECT_WHERE, options)
});

export { };

