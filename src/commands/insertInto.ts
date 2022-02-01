/// <reference types="cypress" />

import { InsertInto } from "../models";
import { MysqlTask } from "../tasks";

declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            mysqlInsertInto<T>(options: InsertInto<Partial<T>>): Chainable<[any]>
        }
    }
}

Cypress.Commands.add(MysqlTask.INSERT, (options: InsertInto<any>) => {
    return cy.task(MysqlTask.INSERT, options)
});

export { };
