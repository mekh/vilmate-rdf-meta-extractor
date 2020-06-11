const each = require('jest-each').default;
const { Master } = require('../../cluster/master');

const logger = new Proxy({}, {
    get(obj, prop) {
        // eslint-disable-next-line no-param-reassign
        obj[prop] = () => {};
        return obj[prop];
    },
});

describe('# Cluster - Mater', () => {
    describe('common tests', () => {
        it('should return an instance', () => {
            const workers = [];
            const callback = () => {};

            const master = new Master(workers, callback, logger);

            expect(master).toBeInstanceOf(Master);
            expect(master.workers).toBe(workers);
            expect(master.workerCallback).toBe(callback);
            expect(master.logger).toBe(logger);
        });

        it('should use a default logger', () => {
            const workers = [];

            const master = new Master(workers);
            expect(master.logger).not.toBeUndefined();
        });

        it('should use a default callback', () => {
            const workers = [];

            const master = new Master(workers);
            expect(master.workerCallback).toBeInstanceOf(Function);
        });
    });

    describe('instance methods', () => {
        let master;
        let worker1;
        let worker2;
        let callback;
        beforeEach(() => {
            const getWorker = id => ({
                id,
                process: { pid: 1 },
                on: jest.fn(data => data),
                send: jest.fn(data => data),
            });
            worker1 = getWorker(1);
            worker2 = getWorker(2);

            const workers = [worker1, worker2];

            callback = jest.fn().mockImplementation(data => data);
            master = new Master(workers, callback(), logger);
        });

        it('should init workers', () => {
            expect(worker1.on).toBeCalled();
            expect(worker1.on).toBeCalledWith('message', expect.any(Function));
            expect(worker1.on).toBeCalledWith('exit', expect.any(Function));

            expect(worker2.on).toBeCalled();
            expect(worker2.on).toBeCalledWith('message', expect.any(Function));
            expect(worker2.on).toBeCalledWith('exit', expect.any(Function));

            expect(master.jobs).toHaveProperty(worker1.id.toString());
            expect(master.jobs).toHaveProperty(worker2.id.toString());

            expect(master.jobs[worker1.id]).toBe(0);
            expect(master.jobs[worker2.id]).toBe(0);
        });

        it('should receive data from worker', () => {
            const params = 'a';
            master.sendToWorker(params);
            expect(worker1.send).toBeCalledWith({ data: params });
        });

        it('should increase the total number of jobs and decrease the number of jobs of a worker', () => {
            master.sendToWorker('a');
            expect(master.jobNumber).toBe(1);
            expect(master.jobs[worker1.id]).toBe(1);
        });

        it('should not send exit signal to a worker if it has active tasks', async () => {
            master.jobs[worker1.id] = 2;
            const res = await master.onWorkerMessage('a', worker1);
            expect(worker1.send).not.toBeCalledWith({ data: null, exit: true });
            expect(res).toBeUndefined();
        });

        it('should send exit signal to a worker when all tasks are done', async () => {
            master.jobs[worker1.id] = 1;
            await master.onWorkerMessage('a', worker1);
            expect(worker1.send).toBeCalledWith({ data: null, exit: true });
        });

        it('should not crash on callback call error', () => {
            master.workerCallback = () => { throw new Error('OMG!!!'); };
            master.jobs[worker1.id] = 1;
            expect(() => master.onWorkerMessage('a', worker1)).not.toThrow();
            expect(worker1.send).toBeCalled();
        });

        it('should add subscription to workers', () => {
            const worker = {
                id: 3,
                process: { pid: 1 },
                on: async (event, cb) => cb('a', worker),
                send: () => {},
            };

            const spyOnWorkerExit = jest.spyOn(Master.prototype, 'onWorkerExit')
                .mockImplementation(data => data);

            const spyOnWorkerMessage = jest.spyOn(Master.prototype, 'onWorkerMessage')
                .mockImplementation(data => data);

            const m = new Master([worker], callback, logger);

            expect(m.onWorkerMessage).toBeCalledWith('a', worker);
            expect(m.onWorkerExit).toBeCalledWith('a', worker);

            spyOnWorkerExit.mockRestore();
            spyOnWorkerMessage.mockRestore();
        });

        it('should return from onWorkerExit', () => {
            expect(master.onWorkerExit(1, worker1)).toBeUndefined();
        });
    });

    describe('Round-robin', () => {
        let master;
        let worker1;
        let worker2;
        let worker3;
        beforeAll(() => {
            const getWorker = (id) => ({
                id,
                calls: 0,
                on: jest.fn(data => data),
                send() { this.calls += 1; },
            });

            worker1 = getWorker(1);
            worker2 = getWorker(2);
            worker3 = getWorker(3);

            const workers = [worker1, worker2, worker3];
            master = new Master(workers, null, logger);
        });

        each([
            [1, 0, 0],
            [1, 1, 0],
            [1, 1, 1],
            [2, 1, 1],
            [2, 2, 1],
            [2, 2, 2],
        ])
            .it('should balance using Round-robin strategy', (c1, c2, c3) => {
                master.sendToWorker('a');

                expect(worker1.calls).toBe(c1);
                expect(worker2.calls).toBe(c2);
                expect(worker3.calls).toBe(c3);
            });
    });
});
