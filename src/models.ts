export class MysqlConfig {
    debug = false;
    mysqlOptions: object = {};
}

export type Column = {
    key: string;
    type: string;
}

export interface InsertInto<T> extends Table {
    data?: T
    datas?: T[]
}

export interface Table {
    table: string;
}

export interface SelectById extends Table {
    idKey?: string;
    id: string | number;
}

export interface WhereClause {
    column: string;
    operand?: string;
    value: string | number;
}

interface Where {
    where: WhereClause[]
}

export interface SelectWhere extends Table, Where {

}

export interface DeleteWhere extends Table, Where {

}

export interface CreateTable extends Table {
    columns: Column[]
}