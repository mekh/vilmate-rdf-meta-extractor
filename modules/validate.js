const Ajv = require('ajv');
const defaultSchema = require('../config/bookSchema');

/**
 * Validate parsed content
 * @param {Object} data - an object to be validated
 * @param {Object} schema - ajv schema
 * @param {boolean} shouldThrow - throw an Error if validation is failed
 */
const validate = ({ data, schema = defaultSchema, shouldThrow = true }) => {
    const ajv = new Ajv({ allErrors: true, coerceTypes: true });

    if (!ajv.validate(schema, data)) {
        if (shouldThrow) {
            throw new Error(ajv.errorsText());
        }
        return null;
    }

    return data;
};

module.exports = {
    validate,
};
