/// <reference types="cypress" />

import { InsertInto } from "../models";
import { MysqlTask } from "../tasks";

declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            mysqlInsertInto<T>(options: InsertInto): Chainable<[T]>
        }
    }
}

Cypress.Commands.add(MysqlTask.INSERT, (options: InsertInto) => {
    return cy.task(MysqlTask.INSERT, options)
});

export { };
