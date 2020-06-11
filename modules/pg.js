/* eslint-disable import/no-dynamic-require,global-require */
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../config/config');

const modelsPath = path.join(path.resolve(__dirname), '../db/models/');

const sequelize = new Sequelize(config.sequelize);

const models = fs.readdirSync(modelsPath)
    .reduce((acc, file) => {
        const model = require(path.join(modelsPath, file));
        return { ...acc, [model.name]: model(sequelize, Sequelize) };
    }, {});

sequelize.sync().then(() => {});

module.exports = {
    models,
};
