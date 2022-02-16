/// <reference types="cypress" />

import { CreateTable } from "../models";
import { MysqlTask } from "../tasks";

declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            mysqlCreateTable(options: CreateTable): Chainable
        }
    }
}

Cypress.Commands.add(MysqlTask.CREATE_TABLE, (options: CreateTable) => {
    return cy.task(MysqlTask.CREATE_TABLE, options)
});

export { }