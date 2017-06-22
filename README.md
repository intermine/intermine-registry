# InterMine Registry
Web application that will allow users to view, search and administer basic information about existing InterMine instances by consuming a RESTful API. This information includes instances names, URLs, versions, neighbours, branding information, location, twitter account and descriptions.

## Registry API ##

The core of the Intermine Registry App is the restFUL API. It contains endpoints to search and administer instances. These endpoints can be reached through the following base path: `http://intermine.org/registry/service/`

- `POST`    /instances     Add an instance to the registry.
- `GET`     /instances     Get all the instances from the registry.
- `GET`     /instances/{instanceIdOrName}    Get an instance by its ID or Name.
- `PUT`     /instances/{instanceId}    Update an instance.
- `DELETE`  /instances/{instanceId}   Deletes an instance.
- `PUT`     /syncrhonize   Update the branding & version information of every instance.
- `PUT`     /syncrhonize/{instanceIdOrName}    Update the branding & version information of the specified instance.

You can check the [detailed API documentation](http://intermine.org/registry/api-docs/) for more information and testing.

## Installation ##

1. Install [Node.js](https://nodejs.org/en/download/) on your host.

2. Install [MongoDB](https://docs.mongodb.com/getting-started/shell/installation/) on your host.

###### *...Instructions to configure mongo...* ######

3. Clone this repository on your host:
```
git clone https://github.com/intermine/intermine-registry.git
```
4. From your terminal or CMD access to the *registryapp* directory an excecute the following command:
```
npm install
```

###### *...Instructions to configure swagger.json...* ######

5. InterMine Registry should be up and running.
