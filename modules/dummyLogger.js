/**
 * Do nothing on call of any property of an object
 */
module.exports = new Proxy({}, {
    get(obj, prop) {
        // eslint-disable-next-line no-param-reassign
        obj[prop] = () => {};
        return obj[prop];
    },
});
