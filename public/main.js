const {app, BrowserWindow} = require('electron')
const path = require('path')

function createWindow(){
    const win = new BrowserWindow({
        title: 'Favorite Games',
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    })

    win.loadURL('http://localhost:3000');
}

app.whenReady().then(createWindow);


