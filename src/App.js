import logo from "./logo.svg";
import { Fragment, useEffect, useState } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useHistory,
} from "react-router-dom";

const electron = window.require("electron");
function App() {
  const [filesInfo, setFilesInfo] = useState({
    directory: "",
    file: "",
  });

  let ConvertPage = function () {
    let history = useHistory();
    let str =
      "Confirm to convert the file " +
      filesInfo.file +
      "to the directory " +
      filesInfo.directory +
      "   ";
    let [converting, setConverting] = useState(false);
    // alert(
    //   "File is" + filesInfo.file + " and directory is" + filesInfo.directory
    // );
    let convertFile = function (e) {
      setConverting(true);
      e.target.disabled = true;
      electron.ipcRenderer.send(
        "convert-file",
        filesInfo.file,
        filesInfo.directory
      );
      electron.ipcRenderer.on("convertedFile", function (event, res) {
        if (res) {
          alert("Converted files saved to " + filesInfo.directory);
        } else {
          alert("Error happened while converting file!");
          e.target.disabled = false;
        }
        setConverting(false);
      });
    };
    return (
      <div className="App">
        <table>
          <tr>
            <td>{!converting ? str : "Converting...   "}</td>
            <td>
              <button className="Button" onClick={convertFile}>
                Confirm and Convert
              </button>
            </td>
          </tr>
          <tr>
            <td></td>
            <td>
              <button
                className="Button"
                onClick={() => {
                  history.push("/newProject");
                }}
              >
                Start afresh
              </button>
            </td>
          </tr>
        </table>
      </div>
    );
  };
  let SelectFile = function () {
    let history = useHistory();
    let selectFile = function () {
      electron.ipcRenderer.send("select-file");
      electron.ipcRenderer.on("selectedFile", function (event, res) {
        // alert("You selected - " + res);
        setFilesInfo({ directory: filesInfo.directory, file: res });
        history.push("/convertFile");
      });
    };
    return (
      <div className="App">
        <table>
          <tr>
            <td>Select the mp4 file you want to convert to HSS format...</td>
            <td>
              <button className="Button" onClick={selectFile}>
                Select File
              </button>
            </td>
          </tr>
        </table>
      </div>
    );
  };

  let NewProject = function () {
    let history = useHistory();

    let selectDirectory = function () {
      electron.ipcRenderer.send("open-folder");
      electron.ipcRenderer.on("selectedFolder", function (event, res) {
        setFilesInfo({ directory: res, file: filesInfo.file });
        // alert(res);
        // alert("New Directory=" + filesInfo.directory);
        history.push("/selectFile");
      });
    };
    return (
      <div className="App">
        <table>
          <tr>
            <td>
              Select a folder from your desktop to save the converted file to
            </td>
            <td>
              <button className="Button" onClick={selectDirectory}>
                Select Directory
              </button>
            </td>
          </tr>
        </table>
      </div>
    );
  };
  let Home = function () {
    let history = useHistory();
    let startNewProject = function () {
      history.push("/newProject");
    };
    return (
      <Fragment>
        <h1 className="Title"> Video Converter </h1>
        <button className="Button" onClick={startNewProject}>
          New Project
        </button>
      </Fragment>
    );
  };
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Switch>
            <Route path="/newProject">
              <NewProject />
            </Route>
            <Route path="/selectFile">
              <SelectFile />
            </Route>
            <Route path="/convertFile">
              <ConvertPage />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </header>
      </div>
    </Router>
  );
}

export default App;
