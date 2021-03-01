const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const Store = require('./store.js');


// instantiate Store
const store = new Store({
    configName: 'user-preferences',
    defaults: {
        windowBounds : {width: 600, height: 400 },
        user : { email: '', pw: ''}
    }
})


function createWindow() {

    let {width, height} = store.get('windowBounds')

    const win = new BrowserWindow({
        width: width,
        height : height,
        frame : false,
        transparent : true,
        webPreferences: { 
            nodeIntegration : true,
            enableRemoteModule : true
        }
    });

    win.on('resize', () => {
        // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
        // the height, width, and x and y coordinates.
        let { width, height } = win.getBounds();
        // Now that we have them, save them using the `set` method.
        store.set('windowBounds', { width, height });
    });


    win.loadFile('index.html');
    win.webContents.on('did-finish-load', function() {
        win.show();
    });

    ipcMain.handle('dark-mode:toggle', () => {
        if (nativeTheme.shouldUseDarkColors) {
          nativeTheme.themeSource = 'light'
        } else {
          nativeTheme.themeSource = 'dark'
        }
        return nativeTheme.shouldUseDarkColors
    })
    
    ipcMain.handle('dark-mode:system', () => {
    nativeTheme.themeSource = 'system'
    })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})


app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})