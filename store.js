const electron = require('electron');
const path = require('path');
const fs = require('fs');


class Store {
    constructor(opts) {

        /* Renderer process hast to get 'app' bodule via 'remote', where as the main process can
           get it directly. app.getPath('userData') will return a string of the user's app data directory path.
        */ 

        const userDataPath = (electron.app || electron.remote.app).getPath('userData');

        // User 'configName' propoerty to set the file name and path.join to bring it all
        // together as a string
        this.path = path.join(userDataPath, opts.configName + '.json');


        this.data = parseDataFile(this.path, opts.defaults);
    }

    // Return the proporety on the 'data' object

    get(key) {
        return this.data[key];
    }

    // set the property on the data obj
    set(key, val) {
        this.data[key] = val;
        fs.writeFileSync(this.path, JSON.stringify(this.data));
    }
}

function parseDataFile(filePath, defaults) {
    try {
        return JSON.parse(fs.readFileSync(filePath));
    } catch(error) {
        return defaults;
    }
}

module.exports = Store;

