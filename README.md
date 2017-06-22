# InterMine Registry
Web application that will allow users to view, search and administer basic information about existing InterMine instances by consuming a RESTful API. This information includes instances names, URLs, versions, neighbours, branding information, location, twitter account and descriptions.

## Registry API ##

The core of the Intermine Registry App is the restFUL API. It contains endpoints to search and administer instances. These endpoints can be reached through the following base path: `http://intermine.org/registry/service/`

- `POST` /instances     Add an instance to the registry.
- `GET`  /instances     Get all the instances from the registry.
- `GET`  /instances/{instanceIdOrName}    Get an instance by its ID or Name.
- `PUT`  /instances/{instanceId}    Update an instance from the registry.
- `DELETE`  /instances/{instanceId}   Deletes an instance from the registry.
- `PUT`  /syncrhonize   Update the branding & version information of every instance on the registry.
- `PUT`  /syncrhonize/{instanceIdOrName}    Update the branding & version information of the specified instance on the registry.

You can check the (detailed API documentation)[http://intermine.org/registry/api-docs/] for more information and testing.

## Installation ##

1. Install (Node.js)[https://nodejs.org/en/download/] 
