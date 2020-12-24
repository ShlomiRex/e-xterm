const ipc = require("electron").ipcRenderer;


var term = new Terminal();
term.open(document.getElementById('terminal'));

ipc.on("terminal.incomingData", (event, data) => {
    term.write(data);
});

term.onData(e => {
    ipc.send("terminal.keystroke", e);
});


const fitAddon = require("xterm-addon-fit")
//import { FitAddon } from 'xterm-addon-fit';
const fitAddon2 = new fitAddon.FitAddon();
term.loadAddon(fitAddon2);
fitAddon2.fit();