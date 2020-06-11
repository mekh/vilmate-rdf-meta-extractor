const fs = require('fs');
const rdf = require('../../modules/rdf');
const utils = require('../../utils/fsUtils');
const { validate } = require('../../modules/validate');

jest.mock('../../utils/fsUtils');
jest.mock('../../modules/validate');

const rawRdfPath = './test/data/book.rdf';
const rawRdf = fs.readFileSync(rawRdfPath, 'utf-8');

utils.readFile.mockResolvedValue(rawRdf);

const parsedRdf = {
    bookId: 1393,
    title: 'Amours De Voyage',
    authors: [
        'Clough, Arthur Hugh',
    ],
    publisher: 'Project Gutenberg',
    publishDate: '1998-07-01',
    language: 'en',
    subjects: [],
    licenseRights: 'Public domain in the USA.',
};

describe('# Modules - Parser', () => {
    describe('parsing', () => {
        it('should parse RDF properly', () => {
            expect(rdf.parse({ data: rawRdf })).toEqual(parsedRdf);
        });

        it('should call validator', () => {
            validate.mockImplementation(data => data);
            const req = { data: rawRdf, validate: true };
            rdf.parse(req);
            expect(validate).toBeCalledTimes(1);
        });
    });

    describe('read files', () => {
        it('should read and parse a single file', async () => {
            const res = await rdf.readAndParse({ path: rawRdfPath, validate: false });
            expect(res).toEqual(parsedRdf);
        });

        it('should read and parse a batch of files', async () => {
            const res = await rdf.readAndParseBatch({ files: [rawRdfPath, rawRdfPath], validate: false });
            expect(res).toEqual([parsedRdf, parsedRdf]);
        });
    });
});
