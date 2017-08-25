# InterMine Registry
Web application that will allow users to view, search and administer basic information about existing InterMine instances by consuming a RESTful API. This information includes instances names, URLs, versions, neighbours, branding information, location, twitter account and descriptions.

## GSoC 2017 ##
[InterMine registry](http://registry.intermine.org/) was entirely implemented and developed as a GSoC 2017 program project by the student [Leonardo Kuffo](https://github.com/lkuffo). Click [here](https://github.com/intermine/intermine-registry/commits/master?author=lkuffo) to find all of Leonardo's contributions for the project as evidence of his work.


## Registry API ##


The core of the InterMine Registry App is the restFUL API. It contains endpoints to search and administer instances. These endpoints can be reached through the following base path: `http://intermine.org/registry/service/`


- `POST`    /instances     Add an instance to the registry.
- `GET`     /instances     Get all the instances from the registry.
- `GET`     /instances/{instanceIdOrName}    Get an instance by its ID or Name.
- `PUT`     /instances/{instanceId}    Update an instance.
- `DELETE`  /instances/{instanceId}   Deletes an instance.
- `PUT`     /syncrhonize   Update the branding & version information of every instance.
- `PUT`     /syncrhonize/{instanceIdOrName}    Update the branding & version information of the specified instance.

You can check the [detailed API documentation](http://registry.intermine.org/api-docs/) for more information and testing.

## Installation ##

1. Install [Node.js](https://nodejs.org/en/download/) on your host.

2. Install [MongoDB](https://docs.mongodb.com/getting-started/shell/installation/) on your host.

3. Clone this repository on your host:
```
git clone https://github.com/intermine/intermine-registry.git
```
4. From your terminal or CMD access to the *registryapp* directory an execute the following command:
```
npm install
```
5. To run the application, being on the same directory:
```
npm start
```

In addition of running the application, this will also configure the MongoDB environment (database, collection & indexes). If you wish to populate the registry you may do (on another CMD or terminal) `node initRegistry.js`, which will initialize all the registry instances with basic information.

### Configure the API Docs ###

The API-DOCS are generated based on the `swagger.json` file in the repository. In order for the API-DOCS to work correctly, on this file you have to specify the "HOST" and the "SCHEME" of the app (http or https).
