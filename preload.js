const path = require("path");
const fs = require("fs");
const { ipcRenderer, shell } = require("electron");
const { execFile, spawn } = require("child_process");
const createDesktopShortcut = require("create-desktop-shortcuts");

window.addEventListener("DOMContentLoaded", () => {
  const addGameBtnEl = document.getElementById("add-game");
  let gameListUl = document.querySelector(".game-list");

  // check if folder exists if it doesnt then create a new one

  if (fs.existsSync("./MyFavoriteGames")) {
    console.log("favorite games folder found...");

    getAllGames();
  } else {
    console.log("favorite games folder not found... creating folder");
    fs.mkdir(path.join(__dirname, "./MyFavoriteGames"), (err) => {
      if (err) {
        return console.error(err);
      }
      console.log("Favorite Games Folder created successfully!");
      getAllGames();
    });
  }

  // function to get the shortcut games from myfavorite games and list them in the app
  function getAllGames() {
    fs.readdir("./MyFavoriteGames", (err, files) => {
      console.log("going over games in folder...");
      // for (i = 0; i < files.length; i++) {
      //   let listGame = document.createElement("li");
      //   gameListUl.append(listGame);
      //   listGame.innerText = files[i];
      // }
      /* 
const child = execFile('node', ['--version'], (error, stdout, stderr) => {
  if (error) {
    throw error;
  } gameExePath
  console.log(stdout);
}); */
      // idk i like foreachs
      files.forEach((file) => {
        var playBtn = document.createElement("button");
        var listGame = document.createElement("li");
        playBtn.classList.add("play-btn");
        playBtn.innerText = "Play Game";
        gameListUl.append(listGame);
        gameListUl.append(playBtn);
        listGame.innerText = file.toString().replace(".lnk", "");
        playBtn.addEventListener("click", () => {
          console.log(`click ${file}`);
          const parsed = shell.readShortcutLink(`./MyFavoriteGames/${file}`);
          console.log(parsed);
          // spawn(`./MyFavoriteGames/${file}`);
          execFile(parsed.target, (error, stdout, stderr) => {
            if (error) {
              console.log(`error: ${error.message}`);
              return;
            }
            if (stderr) {
              console.log(`stderr: ${stderr}`);
              return;
            }
            console.log("stdout: ", stdout);
          });
        });
      });
    });
  }

  //upon clicking  add game file, request the file from the main process
  addGameBtnEl.addEventListener("click", () => {
    ipcRenderer.send("file-request");
  });

  //upon receiving a file, process accordingly
  ipcRenderer.on("file", (event, file) => {
    var gameExePath = file;

    const shortcutsCreated = createDesktopShortcut({
      windows: {
        filePath: file,
        outputPath: path.join(__dirname, "./MyFavoriteGames/"),
      },
    });
    if (shortcutsCreated) {
      console.log(
        `Game executable placed inside ${path.join(
          __dirname,
          "./MyFavoriteGames/"
        )}`
      );
      getAllGames();
    } else {
      console.log(
        'Could not create the icon or set its permissions (in Linux if "chmod" is set to true, or not set)'
      );
    }
  });
});
