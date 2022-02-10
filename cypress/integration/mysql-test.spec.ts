import dayjs = require('dayjs')
import { MysqlTask } from '../../dist/tasks'
import { Person } from '../models/person'

describe('Mysql Tests', () => {

    it('Insert Date', () => {
        // Init
        cy.task(MysqlTask.DROP_TABLE, 'person')
        cy.task(MysqlTask.CREATE_TABLE, {
            table: 'person', columns: [
                { key: 'id', type: 'INT PRIMARY KEY NOT NULL AUTO_INCREMENT' },
                { key: 'date', type: 'DATE' }]
        })
        // Test
        cy.task(MysqlTask.INSERT, { table: 'person', data: { date: '2000-05-25' } })
        // Verify
        cy.mysqlSelectAll({ table: 'person' }).then(datas => expect(datas).to.deep.eq([
            {
                date: "2000-05-25T00:00:00.000Z",
                id: 1
            }
        ]))
    })

    it('Insert Datetime', () => {
        const dateTimeToInsertString = dayjs(new Date()).format('YYYY-MM-DDTHH:mm:ss');
        // Init
        cy.task(MysqlTask.DROP_TABLE, 'person')
        cy.task(MysqlTask.CREATE_TABLE, {
            table: 'person', columns: [
                { key: 'id', type: 'INT PRIMARY KEY NOT NULL AUTO_INCREMENT' },
                { key: 'date', type: 'DATETIME' }]
        })
        // Test
        cy.task(MysqlTask.INSERT, { table: 'person', data: { date: dateTimeToInsertString } })
        // Verify
        cy.mysqlSelectAll({ table: 'person' }).then(datas => expect(datas).to.deep.eq([
            {
                date: dateTimeToInsertString + '.000Z',
                id: 1
            }
        ]))
    })

})
