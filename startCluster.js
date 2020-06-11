/* eslint-disable global-require */
const os = require('os');
const cluster = require('cluster');
const config = require('./config/config');
const { Master } = require('./cluster/master');
const { Worker } = require('./cluster/worker');
const { Queue } = require('./modules/queue');
const { parseDir } = require('./seed/parseDir');
const { batchCreate } = require('./db/controllers/book');

const logger = require('./modules/logger')(config.logger);

if (cluster.isMaster) {
    const { batchSize, basePath: path } = config.parser;
    const log = logger.getLogger('MAIN');
    log.info('starting a master process');

    /**
     * Init queue
     */
    const queue = new Queue(batchCreate, null, null, config.queue.concurrency, logger.getLogger('QUEUE'));

    /**
     * Push data returned from worker to a queue
     */
    const onWorkerMessage = async data => queue.push([data.filter(item => item !== null)]);

    /**
     * Create an array of workers depending on number of CPUs
     */
    const getWorkers = () => {
        const cpuCount = os.cpus().length;
        const workers = [];

        for (let i = 0; i < cpuCount; i += 1) {
            const worker = cluster.fork();
            workers.push(worker);
        }

        return workers;
    };

    const workers = getWorkers();
    const master = new Master(workers, onWorkerMessage, logger.getLogger('MASTER'));

    /**
     * Get all the RDF files, send them to workers
     */
    parseDir({ path, batchSize }, master.sendToWorker.bind(master))
        .then(() => {
            log.info('Master process is done, waiting for workers');
        });
} else {
    const worker = new Worker(logger.getLogger(`WORKER ${cluster.worker.id}`));
    worker.start();
}
