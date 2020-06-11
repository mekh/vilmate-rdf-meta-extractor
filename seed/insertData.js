const { Queue } = require('../modules/queue');
const rdf = require('../modules/rdf');
const config = require('../config/config');
const { batchCreate } = require('../db/controllers/book');
const logger = require('../modules/logger')(config.logger);

/**
 * Init queue
 */
const queue = new Queue(batchCreate, null, null, config.queue.concurrency, logger.getLogger('QUEUE'));

/**
 * Parse RDF files, filter objects that are not conforms the validation rules, insert data to the database
 * @param {string[]} files - file paths
 */
const parseAndInsert = files => rdf
    .readAndParseBatch({ files, validate: true, shouldThrow: false })
    .then(data => data.filter(item => item !== null))
    .then(data => queue.push([data]));

module.exports = {
    parseAndInsert,
};
