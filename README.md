# depositbox Gui

Quick Start
-----------
If you wish to build from source, follow the instructions below.

### Prerequisites

* [Git](https://git-scm.org)
* [Node.js](https://nodejs.org)

> If you do not have [Node.js](https://nodejs.org) installed already, install
> it with [NVM](https://github.com/creationix/nvm).

### Setup

Clone this repository
Install Python and setup environmental variable
Install https://www.microsoft.com/en-us/download/confirmation.aspx?id=40760
Install https://www.microsoft.com/en-us/download/confirmation.aspx?id=44914

Install dependencies with NPM.
```bash
git clone https://github.com/xslugx/depositbox.git && cd depositbox
npm install
```

This command should be run inside the inner depositbox/app directory
```bash
/node_modules/.bin/electron-rebuild -w @paulcbetts/system-idle-time -p
```
The electron-rebuild package should be in your depositbox/app/node_modules folder, and also a depositbox/app/node_modules/.bin/electron-rebuild file should be present after you `npm install electron-rebuild` Alsoo check if the depositbox/app/node_modules contains a @paulcbetts/system-idle-time folder. If it does you have scucesfully installed everything needed to develop Tokens.


#### Adding npm modules to your app
This is only needed if you add an npm module
Remember to add your dependency to `app/package.json` file, to do this:


```
cd to depositbox/app directory
npm install name_of_npm_module --save

```bash
npm start
```

Development
-----------

Unlike a traditional Node.js project, this one has 2 separate `package.json`
files: `package.json` and `app/package.json`. The one in the root directory
only contains dependencies for the [Electron](http://electron.atom.io/)-based
build system. It is unlikely that you will need to modify this.

The `app/package.json` contains all of the application's dependencies.

Building
--------

You can package a release for GNU/Linux, OSX, and Windows, by running the
following from the project's root directory.

```bash
npm run release
```
If you run into errors with MAX_PATH and your node modules folders growing above the 260 character limit check out this [post.]
(https://github.com/Microsoft/nodejs-guidelines/blob/master/windows-environment.md#max_path-explanation-and-workarounds)

Once completed, your bundle will be placed in `releases/`. You can only bundle
a release for the operating system on which you are running, so in order to
build for all supported platforms, you will need to have access to each
operating system.

You can use [xdissent/ievms](https://github.com/xdissent/ievms) to setup a
virtual machine for Windows if you are on GNU/Linux or OSX. If you are running
GNU/Linux, there are a number of resources available for setting up a virtual
machine for OSX.

> On Windows, [NSIS](http://nsis.sourceforge.net/Main_Page) is used. You have
> to install it (version 3.0), and add NSIS folder to PATH in environment
> variables, so it is reachable to scripts in this project (path should look
> something like `C:/Program Files (x86)/NSIS`).

Branches
--------
Branch as follows for development.

#### Features
```bash
features/nameOfFeature
```

#### Releases
```bash
releases/nameOfRelease
```

#### Bugs
```bash
bug/nameOfBug
```
