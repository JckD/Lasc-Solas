const { app, BrowserWindow } = require('electron');


function createWindow() {

    const win = new BrowserWindow({
        width: 600,
        height : 200,
        webPreferences: { 
            nodeIntegration : true
        }
    });

    win.loadFile('index.html');
    win.webContents.on('did-finish-load', function() {
        win.show();
    });
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