# Getting Started with the InterMine registry

If you're setting up the registry locally, perhaps to fix a bug or contribute a pull request, here's how to set up your mongo db instance and get it populated with some sample InterMine instances.

## Required dependencies

- A recent version of [node and npm](https://www.npmjs.com/), ideally installed via [nvm](https://github.com/creationix/nvm)
- [MongoDB](https://www.mongodb.com/download-center/community)

## Clone this repository to your host
```
git clone https://github.com/intermine/intermine-registry.git
cd intermine-registry
```

## Setting your environment variables

Once you have node and mongo installed, you'll need to provide the registry with information about where to find the mongo database. One way to do this is to type the following into a terminal:

```bash
export MONGODB_URL=mongodb://localhost:27017/registry     
```

This assumes you have a Mongo server up and running on port 27017 (this is the default port), and it will save all entries to the registry database.

## Start the registry server up

In a console, run this from the registry root folder:

```bash
npm install # this installs the dependencies for the registry
npm start # this starts the server
```

## Create an admin user for the Registry

Inside your registry project folder, run

```bash
node createUser.js
```

 This will prompt you to set a username and password, and then create the entries in the mongo database. The password is hashed.

## Finally, populate the database with some InterMines!

Great job- nearly there now! In order to have some InterMines present in the registry, rather than just a blank page, we'll need to run the `initRegistry.js` script.

First we need to set a couple of settings.

Open up `initRegistry.js` in a text editor. Add your username and password (and if necessary, change the 'host' value, although the default should work if you haven't changed it). This is currently found around line 40.

Once those details are set, run

```bash
node initRegistry.js
```

This will add InterMine entries into the Mongo database. If you visit [http://localhost:3000](http://localhost:3000) you should see the populated entries!
