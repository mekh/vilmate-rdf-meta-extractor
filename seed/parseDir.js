const { listFilesRecursively } = require('../utils/fsUtils');

/**
 * Get RDF files recursively starting from a given path, call a callback function for each batch
 * @param {string} path - path to a directory to be scanned for rdf files
 * @param {number} [batchSize] - batch size
 * @param {function} callback - a callback function
 */
const parseDir = async ({ path, batchSize = 100 }, callback) => {
    let batch = [];

    for await (const file of listFilesRecursively(path)) {
        if (/.*\.rdf$/.test(file)) {
            batch.push(file);

            if (batch.length === batchSize) {
                callback([...batch]);
                batch = [];
            }
        }
    }

    callback(batch);
};

module.exports = {
    parseDir,
};
