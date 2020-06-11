const Ajv = require('ajv');
const { validate } = require('../../modules/validate');
const defaultSchema = require('../../config/bookSchema');

jest.mock('ajv');

describe('# Modules - validate', () => {
    beforeEach(() => {
        Ajv.mockClear();
    });

    it('should apply a default schema', () => {
        const data = 'a';
        const params = { data, shouldThrow: false };

        validate(params);
        expect(Ajv).toBeCalled();
        expect(Ajv.mock.instances[0].validate).toBeCalledWith(
            expect.objectContaining(defaultSchema),
            data,
        );
    });

    it('should accept a custom schema', () => {
        const data = { a: 1 };
        const schema = { z: 'schema' };

        const params = { data, schema, shouldThrow: false };
        validate(params);

        expect(Ajv.mock.instances[0].validate).toBeCalledWith(schema, data);
    });

    it('should throw by default if validation failed', () => {
        const data = 'a';
        expect(() => validate({ data })).toThrow();
    });

    it('should not throw of fail if shouldThrow is false', () => {
        const data = 'a';
        expect(() => validate({ data, shouldThrow: false })).not.toThrow();
    });

    it('should return null if fail and should throw is false', () => {
        const data = { a: 1 };
        expect(validate({ data, shouldThrow: false })).toBeNull();
    });

    it('should return object if validation passed', () => {
        Ajv.prototype.validate = jest.fn().mockReturnValue(true);
        expect(validate({ data: 'a' })).toBe('a');
    });
});
