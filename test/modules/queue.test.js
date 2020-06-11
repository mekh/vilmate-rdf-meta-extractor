/* eslint-disable no-underscore-dangle */
const async = require('async');
const { Queue } = require('../../modules/queue');

jest.mock('async');

describe('# Modules - Queue', () => {
    let taskHandler;
    let queue;
    let asyncQueue;
    beforeEach(() => {
        asyncQueue = {
            drain: jest.fn(),
            error: jest.fn(),
            idle: jest.fn(),
            kill: jest.fn(),
            push: jest.fn(),
            running: jest.fn(),
            length: jest.fn(),
            started: false,
            paused: false,
            concurrency: 0,
        };

        async.queue = jest.fn().mockImplementation(() => asyncQueue);
        taskHandler = jest.fn(data => data);

        queue = new Queue(taskHandler);
    });

    describe('init', () => {
        it('should return an instance', () => {
            expect(queue).toBeInstanceOf(Queue);
            expect(queue.taskHandler).toBe(taskHandler);
            expect(queue._concurrency).toBe(1);
        });

        it('should call init()', () => {
            const spy = jest.spyOn(Queue.prototype, 'init');
            new Queue();

            expect(spy).toBeCalledTimes(1);

            spy.mockRestore();
        });

        it('should setup drain and error handlers', () => {
            expect(asyncQueue.drain).toBeCalledTimes(1);
            expect(asyncQueue.error).toBeCalledTimes(1);
        });

        it('should assign asyncQueue', () => {
            expect(queue.queue).toBe(asyncQueue);
        });

        it('should pass a handler and a concurrency to the asyncQueue', async () => {
            const args = async.queue.mock.calls[0];

            expect(args.length).toBe(2);

            const [callback, concurrency] = args;

            expect(concurrency).toBe(queue._concurrency);
            expect(callback).toBeInstanceOf(Function);
        });
    });

    describe('instance methods', () => {
        it('should set concurrency via setter', () => {
            const concurrency = 10;
            queue.concurrency = concurrency;

            expect(asyncQueue.concurrency).toBe(concurrency);
            expect(queue._concurrency).toBe(concurrency);
        });

        it('should return concurrency via getter', () => {
            asyncQueue.concurrency = 11;
            expect(queue.concurrency).toBe(11);
        });

        it('should add a new task to a queue', () => {
            const task = 'a';
            queue.push(task);
            expect(asyncQueue.push).toBeCalledTimes(1);
            expect(asyncQueue.push).toBeCalledWith(task);
        });

        it('should init a new queue on kill', () => {
            const spy = jest.spyOn(Queue.prototype, 'init');

            queue.kill();

            expect(asyncQueue.kill).toBeCalledTimes(1);
            expect(queue.init).toBeCalledTimes(1);

            spy.mockRestore();
        });

        it('should return status if there is no queue', () => {
            queue.queue = null;

            expect(queue.status).toEqual({
                started: false,
                paused: false,
                running: 0,
                idle: true,
                length: 0,
                concurrency: 1,
            });
        });

        it('should return status', () => {
            asyncQueue.started = 'a';
            asyncQueue.paused = 'b';
            asyncQueue.running.mockReturnValue(1);
            asyncQueue.idle.mockReturnValue(2);
            asyncQueue.length.mockReturnValue(3);
            queue.concurrency = 4;

            expect(queue.status).toEqual({
                started: 'a',
                paused: 'b',
                running: 1,
                idle: 2,
                length: 3,
                concurrency: 4,
            });
        });

        it('should call taskHandler with all arguments', () => {
            const args = [1, 2, 3];
            queue.execute(args);

            expect(taskHandler).toBeCalledWith(args);
        });

        it('should call onDrain if it was defined', () => {
            const [drainCallback] = asyncQueue.drain.mock.calls[0];
            expect(drainCallback).toBeInstanceOf(Function);

            expect(drainCallback()).toBeUndefined();

            queue.onDrain = jest.fn();
            drainCallback();

            expect(queue.onDrain).toBeCalledTimes(1);
        });

        it('should call onError if it was defined', () => {
            const [errorCallback] = asyncQueue.error.mock.calls[0];
            expect(errorCallback).toBeInstanceOf(Function);

            expect(errorCallback('a', 'b')).toBeUndefined();

            queue.onError = jest.fn();
            errorCallback('a', 'b');

            expect(queue.onError).toBeCalledWith('a', 'b');
        });
    });
});
