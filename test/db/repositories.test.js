const pg = require('../../db/repositories/pg-repository');

describe('# DB - PostgreSQL repository', () => {
    let model;
    let dbRes;
    beforeEach(() => {
        model = {
            create: jest.fn(),
            bulkCreate: jest.fn(),
            findOrCreate: jest.fn(),
            findAll: jest.fn(),
            findAndCountAll: jest.fn(),
            update: jest.fn(),
            destroy: jest.fn(),
        };

        dbRes = {
            toJSON: jest.fn().mockReturnValue(1),
        };
    });

    it('should not crash if result is falsy', async () => {
        model.create.mockResolvedValue(null);
        const res = await pg.addData(model);

        expect(res).toBeNull();
    });

    it('addData defaults', async () => {
        model.create.mockResolvedValue(dbRes);
        const res = await pg.addData(model);

        expect(model.create).toBeCalledWith({}, {});
        expect(res).toBe(1);
    });

    it('addData', async () => {
        model.create.mockResolvedValue(dbRes);
        const res = await pg.addData(model, 'data', 'options');

        expect(model.create).toBeCalledWith('data', 'options');
        expect(res).toBe(1);
    });

    it('bulkAdd defaults', async () => {
        model.bulkCreate.mockResolvedValue([dbRes, dbRes]);
        const res = await pg.bulkAdd(model);

        expect(model.bulkCreate).toBeCalledWith([], {});
        expect(res).toEqual([1, 1]);
    });

    it('bulkAdd', async () => {
        model.bulkCreate.mockResolvedValue([dbRes, dbRes]);
        const res = await pg.bulkAdd(model, 'data', 'options');

        expect(model.bulkCreate).toBeCalledWith('data', 'options');
        expect(res).toEqual([1, 1]);
    });

    it('findOrCreate defaults', async () => {
        dbRes.toJSON.mockReturnValue({ a: 1, b: 2 });

        model.findOrCreate.mockResolvedValue([dbRes, 'created']);
        const res = await pg.findOrCreate(model, 'query');

        expect(model.findOrCreate).toBeCalledWith({ where: 'query', defaults: 'query' });
        expect(res).toEqual({ a: 1, b: 2, created: 'created' });
    });

    it('findOrCreate', async () => {
        dbRes.toJSON.mockReturnValue({ a: 1, b: 2 });

        model.findOrCreate.mockResolvedValue([dbRes, 'created']);
        const res = await pg.findOrCreate(model, 'query', 'data', { options: 'options' });

        expect(model.findOrCreate).toBeCalledWith({ options: 'options', where: 'query', defaults: 'data' });
        expect(res).toEqual({ a: 1, b: 2, created: 'created' });
    });

    it('findAll defaults', async () => {
        model.findAll.mockResolvedValue([dbRes, dbRes]);
        const res = await pg.findAll(model, 'query');

        expect(model.findAll).toBeCalledWith({
            where: 'query',
            attributes: null,
            offset: null,
            limit: null,
            order: [],
        });
        expect(res).toEqual([1, 1]);
    });

    it('findAll custom arguments', async () => {
        model.findAll.mockResolvedValue([dbRes, dbRes]);
        const res = await pg.findAll(model, 'query', 'attrs', { offset: 'offset', limit: 'limit' }, 'order');

        expect(model.findAll).toBeCalledWith({
            where: 'query',
            attributes: 'attrs',
            offset: 'offset',
            limit: 'limit',
            order: 'order',
        });
        expect(res).toEqual([1, 1]);
    });

    it('countAll defaults', async () => {
        model.findAndCountAll.mockResolvedValue({ count: 1 });
        const res = await pg.countAll(model);

        expect(model.findAndCountAll).toBeCalledWith({ where: {} });
        expect(res).toEqual({ count: 1 });
    });

    it('countAll null', async () => {
        model.findAndCountAll.mockResolvedValue({ count: null });
        const res = await pg.countAll(model, 'query', { options: 'options' });

        expect(model.findAndCountAll).toBeCalledWith({ where: 'query', options: 'options' });
        expect(res).toEqual({ count: 0 });
    });

    it('countAll not null', async () => {
        model.findAndCountAll.mockResolvedValue({ count: 1 });
        const res = await pg.countAll(model, 'query', { options: 'options' });

        expect(model.findAndCountAll).toBeCalledWith({ where: 'query', options: 'options' });
        expect(res).toEqual({ count: 1 });
    });

    it('updateData defaults', async () => {
        await pg.updateData(model, 'query');

        expect(model.update).toBeCalledWith({}, { where: 'query', returning: true });
    });

    it('updateData', async () => {
        await pg.updateData(model, 'query', 'data');

        expect(model.update).toBeCalledWith('data', { where: 'query', returning: true });
    });

    it('deleteData defaults', async () => {
        await pg.deleteData(model, 'query');

        expect(model.destroy).toBeCalledWith({ where: 'query', force: false });
    });

    it('deleteData custom "force"', async () => {
        await pg.deleteData(model, 'query', true);

        expect(model.destroy).toBeCalledWith({ where: 'query', force: true });
    });
});
