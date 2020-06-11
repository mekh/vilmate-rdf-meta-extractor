const dummyLogger = require('../modules/dummyLogger');

/**
 * A master process handler.
 * This is a common implementation of the Round-robin balancer.
 */
class Master {
    /**
     * Constructor
     * @param workers - an array of workers created by cluster.fork()
     * @param callback - a callback function that will be called when a worker sends a message to the master process
     * @param logger - logger
     */
    constructor(workers, callback, logger) {
        this.workers = workers;
        this.workerCallback = callback || (() => {});
        this.logger = logger || dummyLogger;
        this.jobs = {};
        this.jobNumber = 0;
        this.startTime = Date.now();
        this.initWorkers();
    }

    /**
     * Setup workers handlers, init jobs counter
     */
    initWorkers() {
        this.workers.forEach(worker => {
            this.jobs[worker.id] = 0;

            worker.on('message', data => this.onWorkerMessage(data, worker));
            worker.on('exit', code => this.onWorkerExit(code, worker));
        });
    }

    /**
     * Select a worker, send a message to it
     * @param data - message to be sent to worker
     */
    sendToWorker(data) {
        const worker = this.workers[this.jobNumber % this.workers.length];

        this.logger.trace(`sending a message to worker ${worker.id}, jobs in progress - ${this.jobs[worker.id]}`);
        this.jobNumber += 1;
        this.jobs[worker.id] += 1;
        worker.send({ data });
    }

    /**
     * Process a message received from worker.
     * If the number of jobs of a particular worker is 0 - send exit signal
     * @param data
     * @param worker
     * @return {Promise<void>}
     */
    async onWorkerMessage(data, worker) {
        this.logger.trace(`worker ${worker.id} - finished a job`);
        try {
            await this.workerCallback(data);
        } catch (e) {
            this.logger.error(`worker ${worker.id} - failed to execute a callback: `, e.message, data);
        }

        this.jobs[worker.id] -= 1;
        this.logger.trace(`worker ${worker.id} - jobs in progress - ${this.jobs[worker.id]}`);

        if (this.jobs[worker.id] === 0) {
            this.logger.info(`terminating worker ${worker.id}`, this.jobs);
            worker.send({ data: null, exit: true });
        }
    }

    /**
     * Worker exit handler
     * @param code - worker's exit code
     * @param worker - worker itself
     */
    onWorkerExit(code, worker) {
        this.logger.info(
            `[${worker.process.pid}] [${worker.id}] worker finished, exit code  is ${code}, working time:`,
            Date.now() - this.startTime,
        );
    }
}

module.exports = {
    Master,
};
