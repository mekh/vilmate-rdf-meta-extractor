const rdf = require('../modules/rdf');
const dummyLogger = require('../modules/dummyLogger');

/**
 * Worker implementation for a particular task
 */
class Worker {
    constructor(logger) {
        this.logger = logger || dummyLogger;
    }

    /**
     * Process a message received from the main process
     */
    async onMessage({ data, exit = false }) {
        if (exit) {
            this.logger.info('Exit signal received');
            process.exit(0);
        }
        this.logger.debug('got a message from master');

        rdf.readAndParseBatch({ files: data, validate: true, shouldThrow: false })
            .then(result => process.send(result));
    }

    /**
     * Init worker
     */
    start() {
        this.logger.info('worker started');
        process.on('message', this.onMessage.bind(this));
    }
}

module.exports = {
    Worker,
};
