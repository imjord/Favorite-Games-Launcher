const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "./preload.js"),
      nodeIntegration: true,
    },
  });

  win.loadFile("index.html");
  win.webContents.openDevTools();
  win.setMenu(null);
};

ipcMain.on("file-request", (event) => {
  // If the platform is 'win32' or 'Linux'
  if (process.platform !== "darwin") {
    // Resolves to a Promise<Object>
    dialog
      .showOpenDialog({
        title: "Add Game To Library",
        // defaultPath: path.join(__dirname, "../assets/"),
        buttonLabel: "Add Game",
        // Restricting the user to only exe Files.
        filters: [
          {
            name: "Executables",
            extensions: ["Exe"],
          },
        ],
        // Specifying the File Selector Property
        properties: ["openFile"],
      })
      .then((file) => {
        // Stating whether dialog operation was
        // cancelled or not.
        console.log(file.canceled);
        if (!file.canceled) {
          const filepath = file.filePaths[0].toString();
          event.reply("file", filepath);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    // If the platform is 'darwin' (macOS)
    dialog
      .showOpenDialog({
        title: "Select the File to be uploaded",
        defaultPath: path.join(__dirname, "../assets/"),
        buttonLabel: "Upload",
        filters: [
          {
            name: "Text Files",
            extensions: ["txt", "docx"],
          },
        ],
        // Specifying the File Selector and Directory
        // Selector Property In macOS
        properties: ["openFile", "openDirectory"],
      })
      .then((file) => {
        console.log(file.canceled);
        if (!file.canceled) {
          const filepath = file.filePaths[0].toString();

          event.send("file", filepath);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});