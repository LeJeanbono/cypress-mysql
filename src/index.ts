/// <reference types="cypress" />
/// <reference types="mysql" />

import mysql from "mysql2";
import { Logger } from "./logger";
import { Column, InsertInto, MysqlConfig } from "./models";

let configuration: Cypress.PluginConfigOptions;
let pluginConfig: MysqlConfig;
let client: mysql.Connection;
let logger: Logger;

function init(config: Cypress.PluginConfigOptions, options: MysqlConfig) {
    configuration = config;
    pluginConfig = options;
    client = mysql.createConnection({
        host: configuration.env.MYSQL_HOST,
        port: configuration.env.MYSQL_PORT,
        database: configuration.env.MYSQL_DB,
        user: configuration.env.MYSQL_USER,
        password: configuration.env.MYSQL_PASSWORD,
    });
    logger = new Logger(pluginConfig.debug);
}

function queryRows<T>(query: string): Promise<T[] | null> {
    logger.log(query);
    return new Promise((resolve, reject) => {
        client.query(query, (err: Error, res) => {
            if (err) {
                logger.log(err.message)
                return reject(err);
            }
            // @ts-ignore
            resolve(res[0] ?? null);
        })
    })
}

function queryFirstRow<T>(query: string): Promise<T> {
    logger.log(query);
    return new Promise((resolve, reject) => {
        client.query(query, (err: Error, res) => {
            if (err) {
                return reject(err);
            }
            // @ts-ignore
            resolve(res[0] ?? null);
        })
    })
}

export const mysqlTasks = (config: Cypress.PluginConfigOptions, options: MysqlConfig = new MysqlConfig()) => {
    init(config, options)
    return {
        mysqlQuery,
        mysqlCreateTable,
        mysqlDropTable,
        mysqlInsertInto
    }
}

export function mysqlQuery<T>(query: string): Promise<T[] | null> {
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

export function mysqlCreateTable(options: { table: string, columns: Column[] }) {
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

export function mysqlDropTable(table: string) {
    const query = `DROP TABLE IF EXISTS ${table}`
    return queryRows(query)
}

export function mysqlInsertInto(options: InsertInto): Promise<any> {
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
            values += `'${options.data[key]}'`
            if (index != keys.length - 1) {
                values += ','
            }
        })
        let insertQuery = `INSERT INTO ${options.table}(${keys.join()}) VALUES(${values})`;
        return queryFirstRow(insertQuery);
    }
    throw new Error('Need to specify data or datas attribute')
}

export function plugin(config: Cypress.PluginConfigOptions, on: Cypress.PluginEvents, options: MysqlConfig = new MysqlConfig()) {
    init(config, options)
    on('task', {
        mysqlQuery,
        mysqlCreateTable,
        mysqlDropTable,
        mysqlInsertInto
    })
}