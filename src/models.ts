export class MysqlConfig {
    debug = false;
}

export type Column = {
    key: string;
    type: string;
}

export interface InsertInto extends Table {
    data?: any,
    datas?: any[]
}

export interface Table {
    table: string;
}

export interface SelectById extends Table {
    idKey?: string;
    id: string | number;
}

interface WhereClause {
    column: string;
    operand?: string;
    value: string | number;
}

export interface SelectWhere extends Table {
    where: WhereClause[]
}