console.log("preload.js")

const {
    contextBridge,
    ipcRenderer
} = require("electron");

contextBridge.exposeInMainWorld(
    "api", {
        loadscript(filename){
            require(filename);
        }
    }
);

console.log("preload success")