// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const electron = require('electron');
const ipcMain = electron.ipcMain;
const path = require('path')
const fs = require('fs');


// Enable live reload for Electron too
require('electron-reload')(__dirname, {
  // Note that the path to electron may vary according to the main file
  electron: require(`${__dirname}/node_modules/electron`)
});

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // and load the index.html of the app.
  mainWindow.loadURL('http://127.0.0.1:8080/index.html');
  mainWindow.loadFile('index.html')

  mainWindow.webContents.on('did-finish-load', () => {
    ipcMain.on('save-canvas', (event, canvas) => {
      fs.writeFile("./app/presets/preset.json", canvas, function (err) {
        if (err) {
            console.error(err)
            return
        }
        event.reply('save-canvas-saved', "Canvas Saved to file!");
      });    
    });
  });


  ipcMain.on('load-canvas', (event) => {
    console.log("test");
    fs.readFile("./app/presets/preset.json", 'utf8', (err, canvas) => {
      if (err) {
          console.error(err)
          return
      }
      event.reply('load-canvas-loaded', canvas);
    })
  });
 



  // Open the DevTools. 
  mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.