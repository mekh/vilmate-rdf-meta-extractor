/* eslint-disable no-underscore-dangle */
const async = require('async');
const dummyLogger = require('./dummyLogger');

/**
 * Queue service
 */
class Queue {
    /**
     * Constructor
     */
    constructor(
        taskHandler,
        onDrain,
        onError,
        concurrency,
        logger,
    ) {
        this.taskHandler = taskHandler;
        this.onDrain = onDrain;
        this.onError = onError;
        this._concurrency = concurrency || 1;
        this.logger = logger || dummyLogger;
        this.init();
    }

    /**
     * Set the concurrency
     */
    set concurrency(concurrency) {
        this.logger.debug(`setting concurrency: ${this._concurrency} => ${concurrency}`);
        this._concurrency = concurrency;
        this.queue.concurrency = concurrency;
    }

    /**
     * Execute a queued task
     */
    async execute(...args) {
        this.logger.debug('executing a queued task', this.status);
        return this.taskHandler.apply(this.taskHandler, args);
    }

    /**
     * Get the concurrency
     */
    get concurrency() {
        return this.queue.concurrency;
    }

    /**
     * Init the queue
     */
    init() {
        this.logger.debug('initiating a queue');
        const queue = async.queue(this.execute.bind(this), this._concurrency);

        /**
         * A function that sets a callback that is called
         * when the last item from the `queue` has returned from the `worker`
         */
        queue.drain(() => {
            if (this.onDrain) {
                return this.onDrain();
            }
            this.logger.debug('all queued jobs finished');
        });

        /**
         * A function that sets a callback that is called when a task errors
         */
        queue.error((err, task) => {
            if (this.onError) {
                return this.onError(err, task);
            }
            this.logger.error('failed to execute a queued task:', err.message);
        });

        this.queue = queue;
    }

    /**
     * Get queue status
     */
    get status() {
        return {
            started: this.queue ? this.queue.started : false,
            paused: this.queue ? this.queue.paused : false,
            running: this.queue ? this.queue.running() : 0,
            idle: this.queue ? this.queue.idle() : true,
            length: this.queue ? this.queue.length() : 0,
            concurrency: this.queue ? this.concurrency : this._concurrency,
        };
    }

    /**
     * Kill the queue and init a new one
     */
    kill() {
        this.queue.kill();
        this.init();
    }

    /**
     * Push data to the queue
     */
    push(data) {
        this.logger.debug('adding a new task to the queue', this.status);
        this.queue.push(data);
    }
}

module.exports = {
    Queue,
};
