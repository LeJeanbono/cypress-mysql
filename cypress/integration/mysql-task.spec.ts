import { MysqlTask } from '../../dist/tasks'

describe('Mysql Tasks', () => {

    beforeEach(() => {
        cy.task(MysqlTask.DROP_TABLE, 'person')
        cy.task(MysqlTask.CREATE_TABLE, { table: 'person', columns: [{ key: 'id', type: 'INT PRIMARY KEY NOT NULL AUTO_INCREMENT' }, { key: 'name', type: 'VARCHAR(100)' }] })
    })

    it('Task query', () => {
        // Init
        cy.task(MysqlTask.INSERT, { table: 'person', data: { name: 'me' } })
        // Test
        cy.task(MysqlTask.QUERY, 'SELECT * from person').then(datas => {
            // Verify
            expect(datas).to.deep.equal([{ id: 1, name: 'me' }])
        });
    })

    it('Task select all', () => {
        // Init
        cy.task(MysqlTask.INSERT, { table: 'person', data: { name: 'me' } })
        // Test
        cy.task(MysqlTask.SELECT_ALL, { table: 'person' }).then(datas => {
            // Verify
            expect(datas).to.deep.equal([{ id: 1, name: 'me' }])
        });
    })

    it('Task select where', () => {
        // Init
        cy.task(MysqlTask.INSERT, { table: 'person', datas: [{ name: 'me' }, { name: 'me' }] })
        // Test
        cy.task('mysqlSelectWhere', { table: 'person', where: [{ column: 'name', value: 'me' }] }).then(datas => {
            // Verify
            expect(datas).to.deep.equal([{ id: 1, name: 'me' }, { id: 2, name: 'me' }])
        })
    })

    it('Task select where multi clauses', () => {
        // Init
        cy.task(MysqlTask.INSERT, { table: 'person', datas: [{ name: 'me' }, { name: 'me' }] })
        // Test
        cy.task('mysqlSelectWhere', { table: 'person', where: [{ column: 'name', value: 'me' }, { column: 'id', value: 1 }] }).then(datas => {
            // Verify
            expect(datas).to.deep.equal([{ id: 1, name: 'me' }])
        })
    })

    it('Task delete where multi clauses', () => {
        // Init
        cy.task(MysqlTask.INSERT, { table: 'person', datas: [{ name: 'me' }, { name: 'me' }] })
        // Test
        cy.task('mysqlDeleteWhere', { table: 'person', where: [{ column: 'name', value: 'me' }, { column: 'id', value: 1 }] }).then(deleted => {
            // Verify
            expect(deleted).eq(1)
        })
        cy.task(MysqlTask.SELECT_ALL, { table: 'person' }).then(datas => {
            expect(datas).to.deep.equal([{ id: 2, name: 'me' }])
        })
    })

    it('Task drop table', () => {
        // Init
        cy.task(MysqlTask.QUERY, 'SELECT table_name FROM information_schema.tables WHERE table_schema = "mydb"').then(result => {
            expect(result).to.deep.equal([{ table_name: 'person' }]);
        })
        // Test
        cy.task(MysqlTask.DROP_TABLE, 'person')
        // Verify
        cy.task(MysqlTask.QUERY, 'SELECT table_name FROM information_schema.tables WHERE table_schema = "mydb"').then(result => {
            expect(result).is.empty;
        })
    })

    it('Task create table', () => {
        // Init
        cy.task(MysqlTask.DROP_TABLE, 'person')
        cy.task(MysqlTask.QUERY, 'SELECT table_name FROM information_schema.tables WHERE table_schema = "mydb"').then(result => {
            expect(result).is.empty;
        })
        // Test
        cy.task(MysqlTask.CREATE_TABLE, { table: 'person', columns: [{ key: 'id', type: 'INT PRIMARY KEY NOT NULL AUTO_INCREMENT' }, { key: 'name', type: 'VARCHAR(100)' }] })
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