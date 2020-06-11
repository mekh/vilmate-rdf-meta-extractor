const Book = (sequelize, DataTypes) => sequelize
    .define('book', {
        bookId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        title: {
            allowNull: true,
            type: DataTypes.STRING(1000),
        },
        authors: {
            allowNull: true,
            type: DataTypes.ARRAY(DataTypes.STRING(1000)),
        },
        publisher: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        publishDate: {
            type: DataTypes.DATE,
        },
        language: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        subjects: {
            allowNull: true,
            type: DataTypes.ARRAY(DataTypes.STRING(1000)),
        },
        licenseRights: {
            allowNull: true,
            type: DataTypes.STRING,
        },
    }, {
        underscored: false,
        timestamps: true,
        indexes: [
            { name: 'books_titles', fields: ['title'] },
            { name: 'books_authors', fields: ['authors'] },
            { name: 'books_publishDate', fields: ['publishDate'] },
        ],
    });

module.exports = Book;
