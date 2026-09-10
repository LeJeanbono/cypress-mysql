/// <reference types="cypress" />

import mysql, { OkPacket, ResultSetHeader, RowDataPacket } from "mysql2";
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
    }).catch(err => {
        logger.log(`Unable to get MySQL version: ${err?.message ?? err}`);
    })
}

function queryRows<T>(query: string): Promise<T[]> {
    logger.log(query);
    return new Promise((resolve, reject) => {
        client.query(query, (err: Error | null, res: unknown) => {
            if (err) {
                logger.log(err.message)
                return reject(err);
            }
            resolve(res as T[]);
        })
    })
}

function queryFirstRow<T>(query: string, isResultSetHeader = false, log = true): Promise<T> {
    if (log)
        logger.log(query);
    return new Promise((resolve, reject) => {
        client.query(query, (err: Error | null, res: unknown) => {
            if (err) {
                logger.log((err as Error).message);
                return reject(err);
            }
            if (isResultSetHeader) {
                resolve(res as T);
            } else {
                resolve(((res as RowDataPacket[])[0] ?? null) as T);
            }
        })
    })
}

function mysqlQuery<T>(query: string): Promise<T[] | null> {
    return new Promise((resolve, reject) => {
        logger.log(query)
        client.query(query, (err: Error | null, result: unknown) => {
            if (err) {
                logger.log((err as Error).message);
                reject(err)
                return;
            }
            resolve(result as T[]);
        });
    });
}

function mysqlCreateTable(options: CreateTable) {
    const queryColumns = options.columns.map(column => `${column.key} ${column.type}`).join(', ')
    const query = `CREATE TABLE ${options.table}(${queryColumns})`;
    return queryRows(query);
}

function mysqlDropTable(table: string) {
    const query = `DROP TABLE IF EXISTS ${table}`
    return queryRows(query)
}

function mysqlInsertInto<T>(options: InsertInto<Partial<T>>): Promise<any> {
    if (options.datas) {
        return Promise.all(options.datas.map(data => mysqlInsertInto({ table: options.table, data })))
    }
    if (options.data) {
        const keys = Object.keys(options.data);
        const values = keys.map((key) => {
            // @ts-ignore
            const value = options.data[key];
            return `'${value}'`
        }).join(',')
        const insertQuery = `INSERT INTO ${options.table}(${keys.join()}) VALUES(${values})`;
        return queryFirstRow<OkPacket>(insertQuery, true).then((res) => res.insertId)

    }
    throw new Error('Need to specify data or datas attribute')
}

function mysqlSelectAll<T>(options: Table): Promise<T[]> {
    const query = `SELECT * FROM ${options.table}`;
    return queryRows(query);
}

function mysqlDeleteAll(options: Table): Promise<number> {
    const query = `DELETE FROM ${options.table}`;
    return queryFirstRow<OkPacket>(query, true).then(res => res.affectedRows);
}

function mysqlDeleteWhere(options: DeleteWhere): Promise<number> {
    const query = `DELETE FROM ${options.table} WHERE ${createWhere(options.where)}`;
    return queryFirstRow<OkPacket>(query, true).then(res => res.affectedRows);
}

function createWhere(where: WhereClause[]) {
    return where.map((clause) => `${clause.column} ${clause.operand ?? '='} '${clause.value}'`).join(' AND ');
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

function registerTasks(on: Cypress.PluginEvents) {
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

/**
 * Register the MySQL tasks on Cypress `setupNodeEvents`.
 *
 * Modern usage (Cypress >= 10, recommended):
 *
 * ```ts
 * import { defineConfig } from 'cypress'
 * import { plugin } from '@cypress-tools/mysql'
 *
 * export default defineConfig({
 *   e2e: {
 *     setupNodeEvents(on, config) {
 *       plugin(on, config, { debug: true })
 *       return config
 *     },
 *   },
 * })
 * ```
 */
export function plugin(
    on: Cypress.PluginEvents,
    config: Cypress.PluginConfigOptions,
    options?: MysqlConfig
): void;
/**
 * @deprecated Legacy signature `plugin(config, on, options)` — prefer `plugin(on, config, options)`.
 */
export function plugin(
    config: Cypress.PluginConfigOptions,
    on: Cypress.PluginEvents,
    options?: MysqlConfig
): void;
export function plugin(
    onOrConfig: Cypress.PluginEvents | Cypress.PluginConfigOptions,
    configOrOn: Cypress.PluginConfigOptions | Cypress.PluginEvents,
    options: MysqlConfig = new MysqlConfig()
) {
    // Modern signature: plugin(on, config, options)
    if (typeof onOrConfig === 'function') {
        init(configOrOn as Cypress.PluginConfigOptions, options)
        registerTasks(onOrConfig as Cypress.PluginEvents)
        return;
    }
    // Legacy signature: plugin(config, on, options)
    init(onOrConfig as Cypress.PluginConfigOptions, options)
    registerTasks(configOrOn as Cypress.PluginEvents)
}

/** Alias matching the `configurePlugin(on, config)` convention used by many Cypress plugins. */
export const configurePlugin = plugin;

export { OkPacket, ResultSetHeader, RowDataPacket };
