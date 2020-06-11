# Gutenberg RDF metadata extractor

## Challenge description
The challenge is to build a metadata extractor for all the project [Gutenberg](https://www.gutenberg.org/wiki/Gutenberg:Feeds 'Gutenberg Feeds') titles.
The initial feeding of a database should be done by using [this file]( https://www.gutenberg.org/cache/epub/feeds/rdf-files.tar.zip​ 'The Complete Project Gutenberg Catalog').

Each book has an RDF file which will need to be processed to extract the:
* id (will be a number with 0-5 digits)
* title
* author/s
* publisher (value will always be Gutenberg)
* publication date
* language
* subject/s
* license rights

Note: For some books all of the data won't be available.

Your tasks are:
* Write a function that reads a single file in and outputs the correct output, using something like ​[xml2js](https://www.npmjs.com/package/xml2js 'xml2js')​ or [xmldom](​https://www.npmjs.com/package/xmldom 'xmldom') will probably be useful to read the rdf files
* Store the output in a database of your choice locally for later querying, perhaps something like ​ [sequelize​](https://github.com/sequelize/sequelize 'sequelize')​ with MySQL/PostgreSQL or use something else!
* Write some unit tests in [jest](https://www.npmjs.com/package/jest 'jest') for the code, use it to measure the code coverage
* Run the function against all the rdf files
* Send through the code once you're done!

Important aspects to consider
* Scalability, how long does it take to index all the content
* Reliability, does all the information process correctly?
* Querying the dataset, how should the database be configured to search for specific fields quickly?
    - Title
    - Author name
    - Publication date

## Quick start
```bash
$ npm install
$ npm run migrate
```

Download and unpack [RDF catalog]( https://www.gutenberg.org/cache/epub/feeds/rdf-files.tar.zip​ 'The Complete Project Gutenberg Catalog')

Adjust the config file - set the Postgres options, queue concurrency, log level, the parser options, and the path to the DRF files. 

Then you have a choice of how to run the service:
- to run in cluster mode, execute `npm run cluster`
- to run in single process mode, execute `npm run single`

## Configuration
### Files and environment variables
The default configuration is stored in `./config/config.js`.

#### Sequelize
The Sequelize configuration is located at the `config.sequelize` section.
See more - [sequelize constructor options](https://sequelize.org/v5/class/lib/sequelize.js~Sequelize.html#instance-constructor-constructor 'Sequelize constructor options')

#### Parser
The RDF-parser could be configured by modifying the `config.parser` section;
The options are:
- `batchSize` number - represents the number of files that will be parsed in a single batch
- `basePath` string - a path to a directory where the .drf files are located. The path could be either an absolute one or a relative **to the root folder of the project**

#### Queue
The `concurrency` parameter defines the number of batches that will be processed simultaneously by the Database.
It's pretty easy to connect the queue to something like Redis. 

## Solutions
The were three important aspects I have to consider:
- Scalability
- Reliability
- Database structure

### Reliability
The reliability guaranteed by applying a validation of each document that is going to be inserted into a database.
There are two steps of validation:
- Ajv validates every document
- validation on an orm/database level

Ajv is an easy-to-use, high-performance application. All invalid documents will be deleted before they get to the database, which increases the overall performance of the application.

### Scalability
There are many ways of how to scale a node.js application and improve the performance:
- a simple way is to use a cluster mode that allows us to utilize all the power a particular PC has
- we could create a bunch of small services (parsers), and a main (balancer) service
- we could use Kubernetes for containers/services orchestration
- we could use FaaS solutions
- so on, so forth

I implemented a cluster method - there is the main process that works with the database and sends tasks to the workers.
The worker receives a path to RDF file, reads it, parses it, validates it, and returns an object (or null) to the main process.

The more CPUs we have, the fast the application works.

The cluster method could also be combined with a balancer and/or orchestrator approach.

### Database structure
To be described
