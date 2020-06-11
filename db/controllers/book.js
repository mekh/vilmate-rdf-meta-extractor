const { addData, findAll, countAll, updateData, deleteData, bulkAdd } = require('../repositories/pg-repository');
const { models } = require('../../modules/pg');

const { Book } = models;

/**
 * Create new record
 */
const create = async (data) => addData(Book, data);

/**
 * Create new records
 */
const batchCreate = async (data) => bulkAdd(Book, data, {
    returning: true,
    updateOnDuplicate: [...Object.keys(data), 'updatedAt'],
});

/**
 * Get records
 */
const get = async (query = {}) => findAll(Book, query);

/**
 * Count records
 */
const count = async (query = {}) => countAll(Book, query, {});

/**
 * Update single record
 */
const update = async (bookId, data) => updateData(Book, { bookId }, data);

/**
 * Delete single record
 */
const remove = async (bookId) => deleteData(Book, { bookId });


module.exports = {
    create,
    batchCreate,
    get,
    count,
    update,
    remove,
};
