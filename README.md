[![Moleculer](https://badgen.net/badge/Powered%20by/Moleculer/0e83cd)](https://moleculer.services)

# tydids-ssi-consent-router
** The microservice provides a solution for handling SSI (Self Sourvereign Identity) protected grants and ensuring that users have the ability to revoke consent. By using the microservice, developers can easily integrate SSI into their existing webforms without having to modify the underlying code. **

## Key Features
- Scalability: Based on the moleculer.service microservice framework, it can be used directly for large scalability.
- Durability: The storage backend is based on pouchdb which ensures durability.
- Lightweight Design: Makes it easy to use SSI for consent in existing environments.

## Demo

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/energychain/tydids-ssi-consent-router)


## Concept
The microservice is designed to be used in web applications that collect sensitive data, such as a user's real name, phone number, and email address. By using SSI, the microservice ensures that the user has the ability to revoke consent at a later time.

The way a developer uses this microservice is by letting a webform submit to the `/frontend/submit` endpoint. Depending on the configuration in the `.env` file, the user will either be redirected to a configured URL or the request will be forwarded to another URL, where the microservice will do a POST request and capture the results redirect location and send it with the response. In other words, the microservice can be used as a snap-in to existing webforms by setting the `<form action>` to the microservice and configuring the `FORWARD_URL`to the original target.


## Installation
The microservice requires Node JS 18.x or higher to be installed. It can also run as a docker container.

To install the microservice, follow these steps:

```shell
git clone https://github.com/energychain/tydids-ssi-consent-router
cd tydids-ssi-consent-router
npm install
cp sample.env .env
```

## Configuration
The configuration is mainly in the `.env` file. You need to configure at least the `PRIVATE_KEY`. To create a new private key, run `npm run createPrivateKey`.

## Usage
To start the microservice, run `npm start`. 
A test webform should be accessible at http://localhost:3000/showcase.html


## Useful links
* TyDIDs Core: https://github.com/energychain/tydids-core
* TyDIDs Consent jQuery Extension: https://www.npmjs.com/package/tydids-jquery-consent 
* Moleculer website: https://moleculer.services/
* Moleculer Documentation: https://moleculer.services/docs/0.14/

## NPM scripts

- `npm run dev`: Start development mode (load all services locally with hot-reload & REPL)
- `npm run start`: Start production mode (set `SERVICES` env variable to load certain services)
- `npm run cli`: Start a CLI and connect to production. Don't forget to set production namespace with `--ns` argument in script
- `npm run ci`: Run continuous test mode with watching
- `npm test`: Run tests & generate coverage report
- `npm run dc:up`: Start the stack with Docker Compose
- `npm run dc:down`: Stop the stack with Docker Compose

## [License: Apache-2.0](./LICENSE)

## Maintainer / Impressum

<addr>
STROMDAO GmbH  <br/>
Gerhard Weiser Ring 29  <br/>
69256 Mauer  <br/>
Germany  <br/>
  <br/>
+49 6226 968 009 0  <br/>
  <br/>
dev@stromdao.com  <br/>
  <br/>
Handelsregister: HRB 728691 (Amtsgericht Mannheim)<br/>
  <br/>
https://stromdao.de/<br/>
</addr>