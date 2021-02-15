const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');


function createWindow() {

    const win = new BrowserWindow({
        width: 600,
        height : 400,
        frame : false,
        transparent : true,
        webPreferences: { 
            nodeIntegration : true,
            enableRemoteModule : true
        }
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