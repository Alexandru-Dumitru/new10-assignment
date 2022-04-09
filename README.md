# Node.js Assignment (Serverless)

> We are going to (re)write a simple loan application, that will be split in two apps and communicate with each other through a REST API. The main goal of this assignment is to test your skills understanding, implementing new functionality, refactoring and writing tests. The current code is full of bad practices, outdated libraries and inconsistencies, and it's your goal to make it shine and up-to-date, keeping it simple enough.

### Requirements

-   Node (or Nvm)
-   Serverless.com CLI
-   Yarn (optional)

### Getting started

-   Install dependencies: `yarn install`
-   Install local dynamodb (required workaround): `serverless dynamodb install`
-   Run tests: `yarn test`
-   Run for development: `yarn start`
-   Check lint issues: `yarn lint`

### Technologies

-   Platform: Node.js
-   Programming language: Javascript (ES6) / Typescript (preferred)
-   Framework: Serverless.com
-   Main AWS Services: Lambda, DynamoDB

## The assignment

-   To make it easy for you and for us, almost everything should run locally (note that serverless-offline and dynamodb-local are already in place)
-   Feel free to move, delete and create as many files as you need
-   The `app1` has most of the API that needs to be refactored and extended. The `app2` is the application responsible for the disbursement.
-   We expect that you write unit tests for most of your code, but be pragmatic and don't try to cover 100%
-   Task 1: redesign the API and implement proper validations on inputs, with proper error messages and status code
-   Task 2: extend the create loan endpoint to also receive the `id` of the company on [openkvk](https://overheid.io/documentatie/openkvk). Only `active` companies should be allowed and you should store all information about the company on DynamoDB.
-   Task 3: implement disburse functionality (see instructions below)
-   Task 4: The current code is full of bad practices, outdated libraries and inconsistencies, and it's your goal to make it shine and up-to-date, keeping it simple enough.

### Disbursement

For the disbursement, you will need to implement a new endpoint on app2 for that.

-   app1: calls an endpoint on app2 to update the loan
-   app2: process the API request and updates the loan status to `disbursed`

## Tips

- Think about the API. Does it make sense? Does it follows the best practices?
- Think about your error handling flow.
- Think about the libraries used, don’t take the libraries that we included as mandatory.
- Rethink how the example project uses async/await.

