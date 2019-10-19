const { Client }        = require('pg');
const { types }         = require('pg');
const { validateValue } = require('immunitet.js');
const { isEmpty }       = require('./lib/functional-utils');
const { singularize }   = require('./lib/fox-inflector');

const DB_PORT = '5432';
const DB_USER = 'postgres';
const DB_HOST = '192.168.31.128';
const DB_NAME = 'med';
const DB_PASSWORD = 'postgres';

const dbConfigs = {
    user:     DB_USER,
    host:     DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port:     DB_PORT,
};

const RESULT_TYPES = {
    single:           'single',
    multiple:         'multiple',
    count:            'count',
    affected_records: 'affectedRecords',
};

const ORDER_DIRECTIONS = {
    ASC:  'ASC',
    DESC: 'DESC',
};

const QUERY_TYPES = {
    select: 'select',
    insert: 'insert',
    update: 'update',
    delete: 'delete',
};

// Fix for parsing of numeric fields
types.setTypeParser(20, value => parseFloat(value));
// types.setTypeParser(700, value => parseFloat(value));
// types.setTypeParser(701, value => parseFloat(value));
types.setTypeParser(1700, value => parseFloat(value));

const client = new Client(dbConfigs);

client.connect()
    .then((result) => {
        console.log('Ready for query: ', result);
    })
    .catch((error) => {
        console.error('Error: ', error);
    });

function getKeyIds(length) {
    const result = [];
    for (let i = 1; i <= length; i++)
        result.push(`\$${i}`);


    return result;
}

function getKeyIndexFields(fields, currentIndex, sourceTableShort) {
    let i = currentIndex;
    const result = [];
    const sourceShortName = sourceTableShort && `${sourceTableShort}.` || '';
    for (const key in fields) {
        result.push(`${sourceShortName}${key} = \$${i}`);
        i++;
    }

    return [result, i];
}

function runQuery(query, queryParams, resultType) {
    return new Promise((resolve, reject) => {
        client.query(query, queryParams, (error, result) => {
            if (error)
                return reject(error);


            resolve(
                extractResult(result, resultType)
            );
        });
    });
}

function extractResult(result, resultType) {
    if (resultType === RESULT_TYPES.single)
        return result.rows.pop();

    if (resultType === RESULT_TYPES.multiple)
        return result.rows;

    if (resultType === RESULT_TYPES.affected_records)
        return result.rowCount;

    throw new Error('Undefined result type!');
}

function getForeignKey(tableName, fKey, pKey) {
    if (fKey)
        return fKey;

    return singularize(tableName) + '_' + pKey;
}

function buildHasOneRelation(modelConfig, { target, foreignKey }) {
    if (!target)
        return '';

    const sourceTable = modelConfig.modelName;
    const sourceKey   = modelConfig.primaryKey;
    const targetTable = target.modelConfig.modelName;
    const targetKey   = getForeignKey(modelConfig.modelName, foreignKey, modelConfig.primaryKey);

    return ` FROM ${sourceTable} s LEFT JOIN ${targetTable} t ON s.${sourceKey} = t.${targetKey}`;
}

const Orm = {
    STRING:  'STRING',
    INTEGER: 'INTEGER',
    BOOLEAN: 'BOOLEAN',

    createModel(fieldsConfig, modelConfigs) {
        const sourceTableShort = modelConfigs.sourceTableShort || (modelConfigs.hasOne && modelConfigs.hasOne.target && 's') || '';
        const targetTableShort = modelConfigs.targetTableShort || (modelConfigs.hasOne && modelConfigs.hasOne.target && 't') || '';

        const modelConfig = {
            sourceTableShort,
            targetTableShort,
            primaryKey:       modelConfigs.primaryKey || 'id',
            modelName:        modelConfigs.modelName,
        };

        const Query = {
            lastArgIndex:    0,
            modelConfig,
            hasOne:          { ...modelConfigs.hasOne },
            queryType:       '',
            selectFields:    [],
            updateArgValues: [],
            updateFields:    [],
            whereFields:     [],
            whereArgValues:  [],
            resultType:      RESULT_TYPES.single,
            orderByFields:   {},
            fieldsConfig,

            where(fields) {
                const [keyIndexFields, lastIndex] = getKeyIndexFields(fields, this.lastArgIndex, this.modelConfig.sourceTableShort);
                this.lastArgIndex = lastIndex;
                this.whereFields = [...this.whereFields, ...keyIndexFields];
                this.whereArgValues = [...this.whereArgValues, ...Object.values(fields)];

                return this;
            },

            limit(recordsNumber) {
                if (!recordsNumber)
                    return this;

                this.limitRecords = parseInt(recordsNumber);

                if (this.queryType === QUERY_TYPES.select)
                    this.resultType = this.limitRecords === 1 ? RESULT_TYPES.single : RESULT_TYPES.multiple;

                return this;
            },

            orderBy(fields) {
                this.orderByFields = { ...this.orderByFields, ...fields };
                return this;
            },

            run() {
                if (this.queryType === QUERY_TYPES.update)
                    return this.runUpdateQuery();

                if (this.queryType === QUERY_TYPES.select)
                    return this.runSelectQuery();

                if (this.queryType === QUERY_TYPES.delete)
                    return this.runDeleteQuery();

                return null;
            },

            runUpdateQuery() {
                let updateQuery = `UPDATE ${this.modelConfig.modelName} SET ${this.updateFields.join(', ')}`;
                if (this.whereFields.length > 0)
                    updateQuery += ` WHERE ${this.whereFields.join(' AND ')}`;
                updateQuery += ' RETURNING *';
                console.log('updateQuery:', updateQuery);

                return runQuery(updateQuery, [...this.updateArgValues, ...this.whereArgValues], this.resultType);
            },

            runSelectQuery() {
                const selectFields = this.selectFields.length === 0 ? '*' : this.selectFields.join(', ');
                let selectQuery = `SELECT ${selectFields}`;

                const hasOneJoin = buildHasOneRelation(this.modelConfig, this.hasOne);
                selectQuery += hasOneJoin || ` FROM ${this.modelConfig.modelName} s`;

                if (this.whereFields.length > 0)
                    selectQuery += ` WHERE ${this.whereFields.join(' AND ')}`;

                if (Object.keys(this.orderByFields).length > 0) {
                    try {
                        const orderByFields = Object.keys(this.orderByFields)
                            .map((field) => {
                                const orderDirection = this.orderByFields[field].toUpperCase();
                                if (!ORDER_DIRECTIONS[orderDirection])
                                    throw new Error('Wrong order direction specified! Must be one of: ASC, DESC');

                                const sourceShortName = this.modelConfig.sourceTableShort && `${this.modelConfig.sourceTableShort}.` || '';
                                return `${sourceShortName}${field} ${orderDirection}`;
                            })
                            .join(', ');
                        selectQuery += ` ORDER BY ${orderByFields}`;
                    } catch (error) {
                        return Promise.reject(error);
                    }
                }

                if (this.limitRecords > 0)
                    selectQuery += ` LIMIT ${this.limitRecords}`;

                console.log('selectQuery:', selectQuery);

                return runQuery(selectQuery, this.whereArgValues, this.resultType);
            },

            runDeleteQuery() {
                let selectQuery = `DELETE FROM ${this.modelConfig.modelName} WHERE ctid IN (`;
                selectQuery += `SELECT ctid FROM ${this.modelConfig.modelName}`;

                if (this.whereFields.length > 0)
                    selectQuery += ` WHERE ${this.whereFields.join(' AND ')}`;

                if (this.limitRecords > 0)
                    selectQuery += ` LIMIT ${this.limitRecords}`;

                selectQuery += ') RETURNING *';

                return runQuery(selectQuery, this.whereArgValues, this.resultType);
            },
        };

        const model = {
            modelConfig,
            hasOne:          { ...modelConfigs.hasOne },

            select: (fields) => {
                const query = Object.create(Query);

                query.queryType = QUERY_TYPES.select;
                query.resultType = RESULT_TYPES.multiple;
                query.selectFields = isEmpty(fields) ? [] : fields;
                query.lastArgIndex = 1;

                return query;
            },

            delete: (fields) => {
                const [keyWhereFields, lastIndex] = getKeyIndexFields(fields, 1);
                const query = Object.create(Query);

                query.queryType = QUERY_TYPES.delete;
                query.resultType = RESULT_TYPES.affected_records;
                query.modelConfig.sourceTableShort = '';
                query.whereFields = isEmpty(keyWhereFields) ? [] : keyWhereFields;
                query.whereArgValues = Object.values(fields);
                query.lastArgIndex = lastIndex;

                return query;
            },

            create: (fields) => {
                if (Array.isArray(fields)) {
                    const resultPromises = fields.map(data => model.create(data));
                    return Promise.all(resultPromises);
                }

                const validate = validateValue(fieldsConfig);
                const [data, error] = validate(fields);
                if (error)
                    return Promise.reject(error.message);

                const fieldsValues = Object.values(data);
                const fieldsKeys = Object.keys(data);

                const keyIds = getKeyIds(fieldsKeys.length);
                const query = `INSERT INTO ${modelConfig.modelName} (${fieldsKeys.join(', ')}) VALUES (${keyIds.join(', ')}) RETURNING *`;

                return runQuery(query, fieldsValues, RESULT_TYPES.single);
            },

            findById: (id) => {
                const [keyIndexFields, lastIndex] = getKeyIndexFields({ id }, 1, modelConfig.sourceTableShort);
                const query = Object.create(Query);

                query.queryType = QUERY_TYPES.select;
                query.resultType = RESULT_TYPES.single;
                query.whereFields = keyIndexFields;
                query.whereArgValues = [id];
                query.lastArgIndex = lastIndex;
                query.limit(1);

                return query.run();
            },

            findOne: (fields) => {
                const [keyIndexFields, lastIndex] = getKeyIndexFields(fields, 1, modelConfig.sourceTableShort);
                const query = Object.create(Query);

                query.queryType = QUERY_TYPES.select;
                query.resultType = RESULT_TYPES.single;
                query.whereFields = keyIndexFields;
                query.whereArgValues = Object.values(fields);
                query.lastArgIndex = lastIndex;
                query.limit(1);

                return query.run();
            },

            update: (fields) => {
                const [keyIndexFields, lastIndex] = getKeyIndexFields(fields, 1);
                const query = Object.create(Query);

                query.queryType = QUERY_TYPES.update;
                query.modelConfig.sourceTableShort = '';
                query.resultType = RESULT_TYPES.single;
                query.updateFields = keyIndexFields;
                query.updateArgValues = Object.values(fields);
                query.lastArgIndex = lastIndex;

                return query;
            },
        };

        return Object.seal(model);
    }


};

module.exports = {
    Orm,
};

/*

BOOL:         16,
BYTEA:        17,
CHAR:         18,
INT8:         20,
INT2:         21,
INT4:         23,
REGPROC:      24,
TEXT:         25,
OID:         26,
TID:         27,
XID:         28,
CID:         29,
JSON:         114,
XML:         142,
PG_NODE_TREE:   194,
SMGR:         210,
PATH:         602,
POLYGON:      604,
CIDR:         650,
FLOAT4:         700,
FLOAT8:         701,
ABSTIME:      702,
RELTIME:      703,
TINTERVAL:      704,
CIRCLE:         718,
MACADDR8:      774,
MONEY:         790,
MACADDR:      829,
INET:         869,
ACLITEM:      1033,
BPCHAR:         1042,
VARCHAR:      1043,
DATE:         1082,
TIME:         1083,
TIMESTAMP:      1114,
TIMESTAMPTZ:   1184,
INTERVAL:      1186,
TIMETZ:         1266,
BIT:         1560,
VARBIT:         1562,
NUMERIC:      1700,
REFCURSOR:      1790,
REGPROCEDURE:   2202,
REGOPER:      2203,
REGOPERATOR:   2204,
REGCLASS:      2205,
REGTYPE:      2206,
UUID:         2950,
TXID_SNAPSHOT:   2970,
PG_LSN:         3220,
PG_NDISTINCT:   3361,
PG_DEPENDENCIES:3402,
TSVECTOR:      3614,
TSQUERY:      3615,
GTSVECTOR:      3642,
REGCONFIG:      3734,
REGDICTIONARY:   3769,
JSONB:         3802,
REGNAMESPACE:   4089,
REGROLE:      4096

 */
