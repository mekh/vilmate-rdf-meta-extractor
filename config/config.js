module.exports = {
    sequelize: {
        username: process.env.DB_USER || 'alex',
        password: process.env.DB_PASS || '1',
        database: process.env.DB_NAME || 'vilmate',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: null,
    },
    logger: {
        loglevel: process.env.LOG_LEVEL || 'trace',
    },
    parser: {
        batchSize: 200,
        basePath: './data/cache',
    },
    queue: {
        concurrency: 2,
    },
};
