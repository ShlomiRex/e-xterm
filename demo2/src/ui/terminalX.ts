import { ipcRenderer } from "electron";

export default function test(event: { key: string; domEvent: KeyboardEvent; }) {
	ipcRenderer.send("key-pressed", event.key);

}