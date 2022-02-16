/// <reference types="cypress" />
/// <reference types="mysql" />

import mysql, { OkPacket, QueryError, ResultSetHeader, RowDataPacket } from "mysql2";
import { Logger } from "./logger";
import { CreateTable, DeleteWhere, InsertInto, MysqlConfig, SelectWhere, Table, WhereClause } from "./models";

let configuration: Cypress.PluginConfigOptions;
let client: mysql.Connection;
let logger: Logger;

function init(config: Cypress.PluginConfigOptions, options: MysqlConfig) {
    configuration = config;
    client = mysql.createConnection({
        host: configuration.env.MYSQL_HOST,
        port: configuration.env.MYSQL_PORT,
        database: configuration.env.MYSQL_DB,
        user: configuration.env.MYSQL_USER,
        password: configuration.env.MYSQL_PASSWORD,
        ...options.mysqlOptions
    });
    logger = new Logger(options.debug);
    queryFirstRow<any>("SELECT @@VERSION", false, false).then(result => {
        logger.log(`MySQL version: ${result['@@VERSION']}`);
    })
}

function queryRows<T>(query: string): Promise<T[]> {
    logger.log(query);
    return new Promise((resolve, reject) => {
        client.query(query, (err: QueryError, res) => {
            if (err) {
                logger.log(err.message)
                return reject(err);
            }
            // @ts-ignore
            resolve(res);
        })
    })
}

function queryFirstRow<T extends RowDataPacket[][] & RowDataPacket[] & OkPacket & OkPacket[] & ResultSetHeader>(query: string, isResultSetHeader = false, log = true): Promise<T> {
    if (log)
        logger.log(query);
    return new Promise((resolve, reject) => {
        client.query(query, (err: Error, res: T) => {
            if (err) {
                return reject(err);
            }
            if (isResultSetHeader) {
                resolve(res);
            } else {
                // @ts-ignore
                resolve(res[0] ?? null);
            }
        })
    })
}

function mysqlQuery<T>(query: string): Promise<T[] | null> {
    return new Promise((resolve, reject) => {
        logger.log(query)
        client.query(query, (err, result) => {
            if (err) {
                reject(err)
            }
            // @ts-ignore
            resolve(result);
        });
    });
}

function mysqlCreateTable(options: CreateTable) {
    let queryColumns = '';
    options.columns.map((column, index) => {
        queryColumns += `${column.key} ${column.type}`
        if (index != options.columns.length - 1) {
            queryColumns += ', '
        }
    })
    const query = `CREATE TABLE ${options.table}(${queryColumns})`;
    return queryRows(query);
}

function mysqlDropTable(table: string) {
    const query = `DROP TABLE IF EXISTS ${table}`
    return queryRows(query)
}

function mysqlInsertInto<T>(options: InsertInto<Partial<T>>): Promise<any> {
    if (options.datas) {
        return new Promise((resolve, reject) => {
            if (options.datas) {
                Promise.all(options.datas.map(data => mysqlInsertInto({ table: options.table, data }))).then(datas => {
                    resolve(datas)
                }).catch(e => reject(e))
            }
        })
    }
    if (options.data) {
        const keys = Object.keys(options.data);
        let values = "";
        keys.map((key, index) => {
            // @ts-ignore
            const value = options.data[key];
            values += `'${value}'`
            if (index != keys.length - 1) {
                values += ','
            }
        })
        let insertQuery = `INSERT INTO ${options.table}(${keys.join()}) VALUES(${values})`;
        return queryFirstRow<any>(insertQuery, true).then((res) => res.insertId)

    }
    throw new Error('Need to specify data or datas attribute')
}

function mysqlSelectAll<T>(options: Table): Promise<T[]> {
    const query = `SELECT * FROM ${options.table}`;
    return queryRows(query);
}

function mysqlDeleteAll<T extends RowDataPacket[][] & RowDataPacket[] & OkPacket & OkPacket[] & ResultSetHeader>(options: Table): Promise<number> {
    const query = `DELETE FROM ${options.table}`;
    return queryFirstRow<T>(query, true).then(res => res.affectedRows);
}

function mysqlDeleteWhere<T extends RowDataPacket[][] & RowDataPacket[] & OkPacket & OkPacket[] & ResultSetHeader>(options: DeleteWhere): Promise<number> {
    const query = `DELETE FROM ${options.table} WHERE ${createWhere(options.where)}`;
    return queryFirstRow<T>(query, true).then(res => res.affectedRows);
}

function createWhere(where: WhereClause[]) {
    let whereClause = "";
    where.forEach((clause, index) => {
        whereClause += `${clause.column} ${clause.operand ?? '='} '${clause.value}'`;
        if (index != where.length - 1) {
            whereClause += ' AND ';
        }
    });
    return whereClause;
}

function mysqlSelectWhere<T>(options: SelectWhere): Promise<T[]> {
    // No where clause, select all
    if (options.where == null) {
        return mysqlSelectAll(options);
    } else {
        const query = `SELECT * FROM ${options.table} WHERE ${createWhere(options.where)}`
        return queryRows(query);
    }
}

export function plugin(config: Cypress.PluginConfigOptions, on: Cypress.PluginEvents, options: MysqlConfig = new MysqlConfig()) {
    init(config, options)
    on('task', {
        mysqlQuery,
        mysqlCreateTable,
        mysqlDropTable,
        mysqlInsertInto,
        mysqlSelectAll,
        mysqlDeleteAll,
        mysqlSelectWhere,
        mysqlDeleteWhere
    })
}
