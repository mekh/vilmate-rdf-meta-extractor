const config = require('./config/config');
const { parseDir } = require('./seed/parseDir');
const { parseAndInsert } = require('./seed/insertData');
const logger = require('./modules/logger')(config.logger);

const log = logger.getLogger('MAIN');
const startTime = Date.now();

log.info('Starting the main process');

parseDir({ path: config.parser.basePath, batchSize: config.parser.batchSize }, parseAndInsert)
    .then(() => log.info('Total time: ', Date.now() - startTime));
