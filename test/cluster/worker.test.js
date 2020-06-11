const { Worker } = require('../../cluster/worker');
const rdf = require('../../modules/rdf');

jest.mock('../../modules/rdf');
jest.mock('../../modules/logger');
jest.mock('cluster');

describe('# Cluster - Worker', () => {
    let worker;
    let rdfReturnValue;
    let spyRdf;

    beforeEach(() => {
        worker = new Worker();
        rdfReturnValue = 'a';
        spyRdf = jest.spyOn(rdf, 'readAndParseBatch').mockResolvedValue(rdfReturnValue);
    });

    it('should return worker instance', () => {
        expect(worker).toBeInstanceOf(Worker);
    });

    it('should exit if exit signal received', () => {
        const spyProcess = jest.spyOn(process, 'exit').mockImplementation(() => {});
        worker.onMessage({ exit: true });
        expect(spyProcess).toBeCalledWith(0);

        spyProcess.mockRestore();
    });

    it('should subscribe on message event', () => {
        const spyProcess = jest.spyOn(process, 'on').mockImplementation(() => {});
        worker.start();
        expect(spyProcess).toBeCalledWith('message', expect.any(Function));

        spyProcess.mockRestore();
    });

    it('should call rdf parser', async () => {
        const spyProcess = jest.spyOn(process, 'send');

        await worker.onMessage({});

        expect(spyRdf).toBeCalled();
        expect(spyProcess).toBeCalledWith(rdfReturnValue);

        spyProcess.mockRestore();
    });
});
