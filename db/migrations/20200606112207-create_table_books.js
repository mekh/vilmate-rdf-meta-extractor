module.exports = {
    up: (queryInterface, Sequelize) => queryInterface
        .createTable('books', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            bookId: {
                type: Sequelize.INTEGER,
                unique: true,
                primaryKey: true,
                allowNull: false,
            },
            title: {
                allowNull: true,
                type: Sequelize.STRING(1000),
            },
            authors: {
                allowNull: true,
                type: Sequelize.ARRAY(Sequelize.STRING(1000)),
            },
            publisher: {
                allowNull: true,
                type: Sequelize.STRING,
            },
            publishDate: {
                type: Sequelize.DATE,
            },
            language: {
                allowNull: true,
                type: Sequelize.STRING,
            },
            subjects: {
                allowNull: true,
                type: Sequelize.ARRAY(Sequelize.STRING(1000)),
            },
            licenseRights: {
                allowNull: true,
                type: Sequelize.STRING,
            },
            createdAt: {
                type: Sequelize.DATE,
            },
            updatedAt: {
                type: Sequelize.DATE,
            },
        }, {
            charset: 'utf8',
            collate: 'utf8_unicode_ci',
        }),
    down: (queryInterface) => queryInterface.dropTable('books'),
};
