// imports
const path = require("path");
const fs = require("fs");
const { ipcRenderer, shell } = require("electron");
const { execFile } = require("child_process");
const createDesktopShortcut = require("create-desktop-shortcuts");

window.addEventListener("DOMContentLoaded", () => {
  // variables from the dommy boi
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

  function playGame(game) {
    try {
      const parsed = shell.readShortcutLink(`./MyFavoriteGames/${game}`);
      execFile(parsed.target, (error, stdout, stderr) => {
        if (error) {
          return;
        }
        if (stderr) {
          return;
        }
      });
    } catch (error) {
      errorMessage(
        "Could not open the game executable, make sure it is a valid executable or check permissions"
      );
    }
  }

  // error function with a message that will dissapear after 5 seconds
  function errorMessage(message) {
    let errorMessageEl = document.querySelector(".message");
    let errorMessageText = document.querySelector("#message");
    errorMessageText.innerText = message;
    errorMessageEl.style.display = "block";
    setTimeout(() => {
      errorMessageEl.style.display = "none";
      errorMessageText.innerText = "";
    }, 5000);
  }

  // function to remove the game from the myfavorite games folder
  function removeGame(gameName) {
    try {
      fs.unlinkSync(`./MyFavoriteGames/${gameName}.lnk`);
      console.log(
        `successfully removed ${gameName} from favorite games folder`
      );
      gameListUl.innerHTML = "";
      getAllGames();
    } catch (err) {
      console.error(err);
      errorMessage(
        "Could not remove the game from the list, please open an issue on github"
      );
    }
  }

  // function to get the shortcut games from myfavorite games and list them in the app
  function getAllGames() {
    fs.readdir("./MyFavoriteGames", (err, files) => {
      console.log("going over games in folder...");
      files.forEach((file) => {
        // variables from the dommy boi
        var playBtn = document.createElement("button");
        var listGame = document.createElement("li");
        var playIcon = document.createElement("img");
        var spanEl = document.createElement("span");
        var removeBtn = document.createElement("button");
        var removeIcon = document.createElement("img");
        // add classes to elements and append them
        // remove button
        removeIcon.setAttribute("src", `./css/remove.ico`);
        removeIcon.classList.add("remove-icon");
        removeBtn.classList.add("remove-btn");
        // play button
        playIcon.setAttribute("src", `./css/play.ico`);
        playIcon.classList.add("play-icon");
        playBtn.classList.add("play-btn");
        // game list n appending
        gameListUl.append(listGame);
        gameListUl.append(spanEl);
        // replace .lnk from the file name so it doesnt show up in the list
        listGame.innerText = file.toString().replace(".lnk", "");
        listGame.append(spanEl);
        spanEl.append(playBtn);
        spanEl.append(removeBtn);
        playBtn.append(playIcon);
        removeBtn.append(removeIcon);
        // add event listeners to buttons
        removeBtn.addEventListener("click", () => {
          removeGame(file.toString().replace(".lnk", ""));
        });
        playBtn.addEventListener("click", () => {
          playGame(file);
        });
      });
    });
  }

  //upon clicking  add game file, request the file from the main process
  addGameBtnEl.addEventListener("click", () => {
    ipcRenderer.send("file-request");
  });
  //upon receiving a file from the icpon main process accordingly
  ipcRenderer.on("file", (event, file) => {
    const shortcutsCreated = createDesktopShortcut({
      windows: {
        filePath: file,
        outputPath: path.join(__dirname, "./MyFavoriteGames"),
      },
    });
    if (shortcutsCreated) {
      console.log(
        `Game executable placed inside ${path.join(
          __dirname,
          "./MyFavoriteGames/"
        )}`
      );
      gameListUl.innerHTML = "";
      getAllGames();
    } else {
      errorMessage(
        '\'Could not create the icon or set its permissions (in Linux if "chmod" is set to true, or not set)'
      );
    }
  });
});
