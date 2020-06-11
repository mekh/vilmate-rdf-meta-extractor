/* eslint-disable max-len */

/**
 *
 * @param result
 * @return {*}
 */
const format = result => (result ? result.toJSON() : result);

/**
 * Adding single element to database
 * @param {Object} model - postgres model
 * @param {Object} [data = {}]
 * @param {Object} [options = {}] https://sequelize.org/master/manual/instances.html#creating-persistent-instances
 * @return {Object} current saved element
 */
const addData = async (model, data = {}, options = {}) => model
    .create(data, options)
    .then(format);

/**
 * Adding list of elements to database
 * @param {Object} model - postgres model
 * @param {Object} [data = []]
 * @param {Object} [options = {}] https://sequelize.org/master/manual/instances.html#working-in-bulk--creating--updating-and-destroying-multiple-rows-at-once-
 * @return {Array} List of new elements without id
 */
const bulkAdd = async (model, data = [], options = {}) => model
    .bulkCreate(data, options)
    .then(r => r.map(format));

/**
 * Find a record or create a new one
 * @param {Object} model - postgres model
 * @param {Object} query - search criteria
 * @param {Object} [data]
 * @param {Object} [options = {}] https://sequelize.org/master/manual/instances.html#creating-persistent-instances
 * @return {Object} current saved element
 */
const findOrCreate = async (model, query, data, options = {}) => {
    const opts = {
        ...options,
        where: query,
        defaults: data || query,
    };
    return model
        .findOrCreate(opts)
        .then(([rec, created]) => ({ ...format(rec), created }));
};

/**
 * Find list of data in database
 * @param {Object} model - postgres model
 * @param {Object} query
 * @param {Object} [attributes = null] - https://sequelize.org/master/manual/querying.html
 * @param {Object} [pagination = {limit: null, skip: null}]
 * @param {Object} [order = []]
 * @return {{Array} || []} List of elements or empty array
 */
const findAll = async (
    model,
    query,
    attributes = null,
    { offset = null, limit = null } = {},
    order = [],
) => model
    .findAll({ where: query, attributes, offset, limit, order })
    .then(r => r.map(format));


/**
 * Count elements in table by query
 * @param {Object} model - postgres model
 * @param {Object} [query = {}]
 * @param {Object} [options = {}] https://sequelize.org/master/manual/models-usage.html#-code-findandcountall--code----search-for-multiple-elements-in-the-database--returns-both-data-and-total-count
 * @return {Object} count of elements
 */
const countAll = async (model, query = {}, options = {}) => {
    const result = await model.findAndCountAll({
        where: query,
        ...options,
    });

    return result.count ? { count: result.count } : { count: 0 };
};

/**
 * Update single element in database
 * @param {Object} model - postgres model
 * @param {Object} query
 * @param {Object} [data = {}]
 * @return number
 */
const updateData = async (model, query, data = {}) => model
    .update(
        data,
        {
            where: query,
            returning: true,
        },
    );

/**
 * Delete single element from database
 * @param {Object} model - postgres model
 * @param {Object} query
 * @param {Boolean} [force = false]
 * @return number
 */
const deleteData = async (model, query, force = false) => model
    .destroy({
        where: query,
        force,
    });


module.exports = {
    addData,
    bulkAdd,
    findOrCreate,
    findAll,
    countAll,
    updateData,
    deleteData,
};
