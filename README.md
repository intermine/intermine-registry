# InterMine Registry
InterMine Registry is a place where all the up-to-date instances information is stored and can be consumed by applications like Blue Genes, iOS, InterMine R, the friendly mine tool or available to everyone who needs it. The core of InterMine Registry is its [RESTful API](http://registry.intermine.org/api-docs/). Running over Node.js integrated with MongoDB, it contains methods (endpoints) to administer the instances on the registry (add, update & delete) and search among them. Furthermore, InterMine Registry also includes a nice fully responsive front-end [web application](http://registry.intermine.org/), from which everyone can see all the InterMine instances and search among them.

## GSoC 2017 ##
[InterMine registry](http://registry.intermine.org/) was entirely implemented and developed as a GSoC 2017 program project by the student [Leonardo Kuffo](https://github.com/lkuffo). Click [here](https://github.com/intermine/intermine-registry/commits/master?author=lkuffo) to find all of Leonardo's contributions for the project as evidence of his work.


## Registry API ##


The core of the InterMine Registry App is the restFUL API. It contains endpoints to search and administer instances. These endpoints can be reached through the following base path: `http://intermine.org/registry/service/`


- `POST`    /instances     Add an instance to the registry.
- `GET`     /instances     Get all the instances from the registry.
- `GET`     /instances/{instanceIdOrName}    Get an instance by its ID or Name.
- `PUT`     /instances/{instanceId}    Update an instance.
- `DELETE`  /instances/{instanceId}   Deletes an instance.
- `PUT`     /synchronize   Update the branding & version information of every instance.
- `PUT`     /synchronize/{instanceIdOrName}    Update the branding & version information of the specified instance.

You can check the [detailed API documentation](http://registry.intermine.org/api-docs/) for more information and testing.

## Installation ##

Please visit [getting started](getting-started.md)

### Configure the API Docs ###

The API-DOCS are generated based on the `swagger.json` file in the repository. In order for the API-DOCS to work correctly, on this file you have to specify the "HOST" and the "SCHEME" of the app (http or https).

## Detailed Documentation ##

For more in-deep information about the code, and detailed guidelines on the project, please, visit the following [link](https://docs.google.com/document/d/1ODWOBPA0XePfXmpKN75GQoBPjvFH9Rnp5yIooD1szXw/edit?usp=sharing).
