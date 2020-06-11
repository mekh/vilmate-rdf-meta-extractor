/**
 * Serialize a log item
 */
const toJson = data => {
    try {
        return JSON.stringify(data);
    } catch (e) {
        return data;
    }
};

/**
 * Log levels
 */
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    trace: 4,
};

/**
 * Create a logger
 */
const getLogger = (loglevel, category = '') => ({
    category,
    log(level, ...args) {
        if (levels[loglevel] < levels[level]) {
            return;
        }

        const message = args.map(toJson).join(', ');
        const prefix = `[${new Date().toISOString()}] [${level.toUpperCase()}] [${process.pid}] [${category}]`;
        console.log(prefix, message);
    },
    error(...args) {
        this.log.call(this, 'error', ...args);
    },
    warn(...args) {
        this.log.call(this, 'warn', ...args);
    },
    info(...args) {
        this.log.call(this, 'info', ...args);
    },
    debug(...args) {
        this.log.call(this, 'debug', ...args);
    },
    trace(...args) {
        this.log.call(this, 'trace', ...args);
    },
});

module.exports = ({ loglevel = 'info' }) => ({
    getLogger: getLogger.bind(null, loglevel),
});
