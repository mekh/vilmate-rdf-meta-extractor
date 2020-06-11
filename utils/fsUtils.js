const fs = require('fs');
const path = require('path');

/**
 * Promisify fs.readFile
 * @param {string} filePath - path to a file
 * @param {("ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex" )} [encoding]
 *      file encoding, default is 'utf-8'
 */
const readFile = (filePath, encoding = 'utf-8') => new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, body) => {
        if (err) {
            return reject(err);
        }

        resolve(body.toString(encoding));
    });
});

/**
 * Promisify fs.readdir
 * @param {string} dirPath - a path to be listed
 * @param {object} options - fs.readdir options
 */
const listDir = (dirPath, options = {}) => new Promise((resolve, reject) => {
    fs.readdir(dirPath, options, (err, content) => {
        if (err) {
            return reject(err);
        }

        resolve(content);
    });
});

/**
 * Returns the list of files in a dirPath and in all the nested directories
 * Usage example:
 *
 * const startPath = '.';
 * for await (file of getFilesRecursively(startPath)) {
 *     console.log(file);
 * }
 *
 * @param {string} dirPath - a start path
 */
async function* listFilesRecursively(dirPath) {
    let list = [];
    try {
        list = await listDir(dirPath, { withFileTypes: true });
    } catch (e) {
        yield new Error(`failed to read a dir content (${dirPath}): ${e.message}`);
    }

    for (const item of list) {
        const itemPath = path.resolve(dirPath, item.name);

        if (item.isDirectory()) {
            yield* listFilesRecursively(itemPath);
        } else {
            yield itemPath;
        }
    }
}

module.exports = {
    listDir,
    readFile,
    listFilesRecursively,
};
