const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require("path");
const url = require("url");
const isDev = require("electron-is-dev");
const { ipcMain } = require("electron");
const { dialog } = require("electron");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
const fs = require("fs");
let mainWindow;

function createWindow() {
  var display = electron.screen.getPrimaryDisplay();
  const scrWidth = display.size.width;
  const scrHeight = display.size.height;

  let winWidth = Math.floor(scrWidth / 2);
  let winHeight = Math.floor((scrHeight * 2) / 4);
  /*
    if(isDev){
        winWidth = 1200
        winHeight = 600
    }*/

  mainWindow = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    x: scrWidth - winWidth - 50,
    y: scrHeight - winHeight - 100,
    resizable: true,
    fullscreenable: true,
    title: "Video Converter",
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on("open-folder", (event) => {
  console.log("hi1");
  dialog.showOpenDialog(
    {
      properties: ["openDirectory"],
    },
    function (fileNames) {
      console.log(fileNames[0]);
      event.sender.send("selectedFolder", fileNames[0]);
    }
  );
});

ipcMain.on("select-file", (event) => {
  console.log("hi2");
  dialog.showOpenDialog(
    {
      filters: [{ name: "Videos", extensions: ["mp4"] }],
      properties: ["openFile"],
    },
    function (fileNames) {
      console.log(fileNames[0]);
      event.sender.send("selectedFile", fileNames[0]);
    }
  );
});
ipcMain.on("convert-file", (event, filename, foldername) => {
  console.log("hi3" + foldername);
  // let stream = fs.createReadStream(path.resolve(filename));
  function callback() {
    fs.writeFile(
      foldername + "/index.m3u8",
      "#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360\n360p.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=842x480\n480p.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720\n720p.m3u8",
      function (err) {
        if (err) {
          event.sender.send("convertedFile", false);
          return console.log(err);
        }
        console.log("The file was saved!");
        event.sender.send("convertedFile", true);
      }
    );
  }
  let proc1 = new ffmpeg(filename)
    .addOptions([
      "-profile:v main",
      "-vf scale=w=640:h=360:force_original_aspect_ratio=decrease",
      "-c:a aac",
      "-ar 48000",
      "-b:a 96k",
      "-c:v h264",
      "-crf 20",
      "-g 48",
      "-keyint_min 48",
      "-sc_threshold 0",
      "-b:v 800k",
      "-maxrate 856k",
      "-bufsize 1200k",
      "-hls_time 10",
      //   "-hls_segment_filename 360p.ts",
      "-hls_playlist_type vod",
      "-f hls",
    ])
    .on("error", (err) => {
      console.log(err);
      event.sender.send("convertedFile", false);
    })
    .output(foldername + "/360p.m3u8");
  proc1.run();
  //   ffmpeg(stream)
  //     .addOptions([
  //       //360
  //       "-profile:v main",
  //       "-vf scale=w=640:h=360:force_original_aspect_ratio=decrease",
  //       "-c:a aac",
  //       "-ar 48000",
  //       "-b:a 96k",
  //       "-c:v h264",
  //       "-crf 20",
  //       "-g 48",
  //       "-keyint_min 48",
  //       "-sc_threshold 0",
  //       "-b:v 800k",
  //       "-maxrate 856k",
  //       "-bufsize 1200k",
  //       "-hls_time 10",
  //       "-hls_segment_filename 360p.ts",
  //       "-hls_playlist_type vod",
  //       "-f hls",
  //     ])
  //     .on("error", (err) => {
  //       console.log(err);
  //       event.sender.send("convertedFile", false);
  //     })
  //     .output(foldername + "/360p.m3u8")
  //     .run();

  let proc2 = new ffmpeg(filename)
    .addOptions([
      "-profile:v main",
      "-vf scale=w=842:h=480:force_original_aspect_ratio=decrease",
      "-c:a aac",
      "-ar 48000",
      "-b:a 128k",
      "-c:v h264",
      "-crf 20",
      "-g 48",
      "-keyint_min 48",
      "-sc_threshold 0",
      "-b:v 1400k",
      "-maxrate 1498k",
      "-bufsize 2100k",
      "-hls_time 10",
      //   "-hls_segment_filename 480p.ts",
      "-hls_playlist_type vod",
      "-f hls",
    ])
    .on("error", (err) => {
      console.log(err);
      event.sender.send("convertedFile", false);
    })
    .output(foldername + "/480p.m3u8");
  proc2.run();

  let proc3 = new ffmpeg(filename)
    .addOptions([
      "-profile:v main",
      "-vf scale=w=1280:h=720:force_original_aspect_ratio=decrease",
      "-c:a aac",
      "-ar 48000",
      "-b:a 128k",
      "-c:v h264",
      "-crf 20",
      "-g 48",
      "-keyint_min 48",
      "-sc_threshold 0",
      "-b:v 2800k",
      "-maxrate 2996k",
      "-bufsize 4200k",
      "-hls_time 10",
      // "-hls_segment_filename 720p.ts",
      "-hls_playlist_type vod",
      "-f hls",
    ])
    .on("error", (err) => {
      console.log(err);
      event.sender.send("convertedFile", false);
    })
    .output(foldername + "/720p.m3u8")
    .on("end", callback);

  proc3.run();
});
