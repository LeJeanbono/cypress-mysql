import { MysqlTask } from '../../dist/tasks'
import { Person } from '../models/person'

describe('Mysql Commands', () => {

    it('Command query', () => {
        // Init
        cy.task(MysqlTask.DROP_TABLE, 'person')
        cy.task(MysqlTask.CREATE_TABLE, { table: 'person', columns: [{ key: 'id', type: 'INT PRIMARY KEY NOT NULL AUTO_INCREMENT' }, { key: 'name', type: 'VARCHAR(100)' }] })
        cy.task(MysqlTask.INSERT, { table: 'person', data: { name: 'me' } })
        // Test
        cy.mysqlQuery<Person>('SELECT * from person').then(datas => {
            // Verify
            expect(datas).to.deep.equal([{ id: 1, name: 'me' }])
        });
    })

    it('Command select all', () => {
        // Init
        cy.task(MysqlTask.DROP_TABLE, 'person')
        cy.task(MysqlTask.CREATE_TABLE, { table: 'person', columns: [{ key: 'id', type: 'INT PRIMARY KEY NOT NULL AUTO_INCREMENT' }, { key: 'name', type: 'VARCHAR(100)' }] })
        cy.task(MysqlTask.INSERT, { table: 'person', data: { name: 'me' } })
        // Test
        cy.mysqlSelectAll<Person>({ table: 'person' }).then(datas => {
            // Verify
            expect(datas).to.deep.equal([{ id: 1, name: 'me' }])
        });
    })

    it('Command insert into one row', () => {
        // Init
        cy.task(MysqlTask.DROP_TABLE, 'person')
        cy.task(MysqlTask.CREATE_TABLE, { table: 'person', columns: [{ key: 'id', type: 'INT PRIMARY KEY NOT NULL AUTO_INCREMENT' }, { key: 'name', type: 'VARCHAR(100)' }] })
        // Test
        cy.mysqlInsertInto<Person>({ table: 'person', data: { name: 'bob' } }).then(res => {
            // Verify
            expect(res).equal(1);
            cy.task(MysqlTask.SELECT_ALL, { table: 'person' }).then(datas => {
                expect(datas).to.deep.equal([{ id: 1, name: 'bob' }])
            })
        })
    })

    it('Command insert into multi row', () => {
        // Init
        cy.task(MysqlTask.DROP_TABLE, 'person')
        cy.task(MysqlTask.CREATE_TABLE, { table: 'person', columns: [{ key: 'id', type: 'INT PRIMARY KEY NOT NULL AUTO_INCREMENT' }, { key: 'name', type: 'VARCHAR(100)' }] })
        // Test
        cy.mysqlInsertInto<Person>({ table: 'person', datas: [{ name: 'bob' }, { name: 'bobby' }] }).then(res => {
            // Verify
            expect(res).to.deep.equal([1, 2]);
            cy.task(MysqlTask.SELECT_ALL, { table: 'person' }).then(datas => {
                expect(datas).to.deep.equal([{ id: 1, name: 'bob' }, { id: 2, name: 'bobby' }])
            })
        })
    })

    it('Command delete all', () => {
        // Init
        cy.task(MysqlTask.DROP_TABLE, 'person')
        cy.task(MysqlTask.CREATE_TABLE, { table: 'person', columns: [{ key: 'id', type: 'INT PRIMARY KEY NOT NULL AUTO_INCREMENT' }, { key: 'name', type: 'VARCHAR(100)' }] })
        cy.task(MysqlTask.INSERT, { table: 'person', data: { name: 'me' } })
        cy.task(MysqlTask.INSERT, { table: 'person', data: { name: 'me2' } })
        // Test
        cy.mysqlDeleteAll({ table: 'person' }).then(res => expect(res).eq(2));
        // Verify
        cy.task(MysqlTask.SELECT_ALL, { table: 'person' }).then(datas => {
            expect(datas).to.deep.eq([]);
        })
    })

    it('Command select where', () => {
        // Init
        cy.task(MysqlTask.DROP_TABLE, 'person')
        cy.task(MysqlTask.CREATE_TABLE, { table: 'person', columns: [{ key: 'id', type: 'INT PRIMARY KEY NOT NULL AUTO_INCREMENT' }, { key: 'name', type: 'VARCHAR(100)' }] })
        cy.task(MysqlTask.INSERT, { table: 'person', datas: [{ name: 'me' }, { name: 'me' }] })
        // Test
        cy.mysqlSelectWhere<Person>({ table: 'person', where: [{ column: 'name', value: 'me' }] }).then(datas => {
            // Verify
            expect(datas).to.deep.equal([{ id: 1, name: 'me' }, { id: 2, name: 'me' }])
        })
    })

    it('Command select where multi clauses', () => {
        // Init
        cy.task(MysqlTask.DROP_TABLE, 'person')
        cy.task(MysqlTask.CREATE_TABLE, { table: 'person', columns: [{ key: 'id', type: 'INT PRIMARY KEY NOT NULL AUTO_INCREMENT' }, { key: 'name', type: 'VARCHAR(100)' }] })
        cy.task(MysqlTask.INSERT, { table: 'person', datas: [{ name: 'me' }, { name: 'me' }] })
        // Test
        cy.mysqlSelectWhere({ table: 'person', where: [{ column: 'name', value: 'me' }, { column: 'id', value: 1 }] }).then(datas => {
            // Verify
            expect(datas).to.deep.equal([{ id: 1, name: 'me' }])
        })
    })

    it('Command delete where multi clauses', () => {
        // Init
        cy.task(MysqlTask.DROP_TABLE, 'person')
        cy.task(MysqlTask.CREATE_TABLE, { table: 'person', columns: [{ key: 'id', type: 'INT PRIMARY KEY NOT NULL AUTO_INCREMENT' }, { key: 'name', type: 'VARCHAR(100)' }] })
        cy.task(MysqlTask.INSERT, { table: 'person', datas: [{ name: 'me' }, { name: 'me' }] })
        // Test
        cy.mysqlDeleteWhere({ table: 'person', where: [{ column: 'name', value: 'me' }, { column: 'id', value: 1 }] }).then(deleted => {
            // Verify
            expect(deleted).eq(1)
        })
        cy.task(MysqlTask.SELECT_ALL, { table: 'person' }).then(datas => {
            expect(datas).to.deep.equal([{ id: 2, name: 'me' }])
        })
    })

    it('Command drop table', () => {
        // Init
        cy.task(MysqlTask.QUERY, 'SELECT table_name FROM information_schema.tables WHERE table_schema = "mydb"').then(result => {
            expect(result).to.deep.equal([{ table_name: 'person' }]);
        })
        // Test
        cy.mysqlDropTable('person')
        // Verify
        cy.task(MysqlTask.QUERY, 'SELECT table_name FROM information_schema.tables WHERE table_schema = "mydb"').then(result => {
            expect(result).is.empty;
        })
    })

    it('Command create table', () => {
        // Init
        cy.task(MysqlTask.DROP_TABLE, 'person')
        cy.task(MysqlTask.QUERY, 'SELECT table_name FROM information_schema.tables WHERE table_schema = "mydb"').then(result => {
            expect(result).is.empty;
        })
        // Test
        cy.mysqlCreateTable({ table: 'person', columns: [{ key: 'id', type: 'INT PRIMARY KEY NOT NULL AUTO_INCREMENT' }, { key: 'name', type: 'VARCHAR(100)' }] })
        // Verify
        cy.task(MysqlTask.QUERY, 'SELECT table_name FROM information_schema.tables WHERE table_schema = "mydb"').then(result => {
            expect(result).to.deep.equal([{ table_name: 'person' }]);
        })
        cy.task(MysqlTask.QUERY, 'DESCRIBE person').then(columns => {
            expect(columns).to.deep.equal([
                {
                    Default: null,
                    Extra: "auto_increment",
                    Field: "id",
                    Key: "PRI",
                    Null: "NO",
                    Type: "int(11)"
                },
                {
                    Default: null,
                    Extra: "",
                    Field: "name",
                    Key: "",
                    Null: "YES",
                    Type: "varchar(100)"
                }
            ])
        })
    })

})
