const cheerio = require('cheerio');
const { readFile } = require('../utils/fsUtils');
const { validate: verify } = require('./validate');

/**
 * Parses RDF file content
 * @param {string} data - the content of a file
 * @param {boolean} [validate] - whether to validate parsed data or not
 * @param {boolean} [shouldThrow] - throw an Error if validation is failed
 */
const parse = ({ data, validate, shouldThrow }) => {
    const $ = cheerio.load(data);

    /**
     * Get an element text
     * @param {number} index
     * @param {Object} elem
     * @return {string}
     */
    const getText = (index, elem) => $(elem).text();

    let obj = {
        bookId: Number($('pgterms\\:ebook').attr('rdf:about').replace('ebooks/', '')),
        title: $('dcterms\\:title').text(),
        authors: $('pgterms\\:agent pgterms\\:name').map(getText).toArray(),
        publisher: $('dcterms\\:publisher').text(),
        publishDate: $('dcterms\\:issued').text(),
        language: $('dcterms\\:language rdf\\:Description').find('rdf\\:value').text(),
        subjects: $('[rdf\\:resource$="/LCSH"]').siblings('rdf\\:value').map(getText).toArray(),
        licenseRights: $('dcterms\\:rights').text(),
    };

    if (validate) {
        obj = verify({ data: obj, shouldThrow });
    }

    return obj;
};

/**
 * Read file content and parse it
 * @param {string} path - path to a file
 * @param {boolean} [validate] - whether to validate parsed data or not
 * @param {boolean} [shouldThrow] - throw an Error if validation is failed
 */
const readAndParse = async ({ path, validate, shouldThrow }) => readFile(path)
    .then(data => parse({ data, validate, shouldThrow }));

/**
 * Read and parse a list of files
 * @param {string[]} files - an array with file paths
 * @param {boolean} [validate]
 * @param {boolean} [shouldThrow] - throw an Error if validation is failed
 */
const readAndParseBatch = async ({ files, validate, shouldThrow }) => Promise.all(
    files.map(path => readAndParse({ path, validate, shouldThrow })),
);

module.exports = {
    parse,
    readAndParse,
    readAndParseBatch,
    validate: verify,
};
