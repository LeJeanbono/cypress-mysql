import { MysqlTask } from '../../dist/tasks'

describe('Mysql Tasks', () => {

    it('Task query', () => {
        // Init
        cy.task(MysqlTask.DROP_TABLE, 'person')
        cy.task(MysqlTask.CREATE_TABLE, { table: 'person', columns: [{ key: 'id', type: 'INT PRIMARY KEY NOT NULL AUTO_INCREMENT' }, { key: 'name', type: 'VARCHAR(100)' }] })
        cy.task(MysqlTask.INSERT, { table: 'person', data: { name: 'me' } })
        // Test
        cy.task(MysqlTask.QUERY, 'SELECT * from person').then(datas => {
            // Verify
            expect(datas).to.deep.equal([{ id: 1, name: 'me' }])
        });
    })
})