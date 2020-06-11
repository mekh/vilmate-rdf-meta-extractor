module.exports = {
    type: 'object',
    definitions: {
        string255: { $id: '#string255', type: 'string', maxLength: 255 },
        string1000: { $id: '#string1000', type: 'string', maxLength: 1000 },
    },
    properties: {
        bookId: { type: 'integer', minimum: 1 },
        title: { $ref: '#/definitions/string1000' },
        authors: { type: 'array', items: { $ref: '#/definitions/string1000' } },
        publisher: { $ref: '#/definitions/string255' },
        publishDate: { $ref: '#/definitions/string255' },
        language: { $ref: '#/definitions/string255' },
        subjects: { type: 'array', items: { $ref: '#/definitions/string255' } },
        licenseRights: { $ref: '#/definitions/string255' },
    },
    additionalProperties: false,
    required: ['bookId', 'title', 'publisher', 'publishDate', 'licenseRights'],
};
