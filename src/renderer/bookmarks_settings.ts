import { SSHSession } from "../shared/session";

const { ipcRenderer } = require('electron')

let bookmarkId: string = undefined;

//This parameter is set after DOM is loaded from main process.
let session: SSHSession = undefined;

const btn_apply = document.getElementById("apply")
const btn_cancel = document.getElementById("cancel")
const btn_delete = document.getElementById("deelete")
const btn_private_key = <HTMLInputElement>document.getElementById("private_key_btn")

const e_remote_host = <HTMLInputElement>document.getElementById("remote_host");
const e_username = <HTMLInputElement>document.getElementById("username");
const e_port = <HTMLInputElement>document.getElementById("port");
const e_x11_forwarding = <HTMLInputElement>document.getElementById("x11_forwarding");
const e_compression = <HTMLInputElement>document.getElementById("compression");
const e_private_key = <HTMLInputElement>document.getElementById("private_key");
const e_private_key_file = <HTMLInputElement>document.getElementById("private_key_file");
const e_session_name = <HTMLInputElement>document.getElementById("session_name");
const e_session_description = <HTMLInputElement>document.getElementById("session_description");


btn_apply.onclick = submitForm
btn_cancel.onclick = cancel
btn_delete.onclick = deleteClicked
btn_private_key.onclick = openContainingFolder

function updateGUI(session: SSHSession) {
	//Update the GUI to match the given session (set GUI elements to match the session settings)
	const protocol = session.protocol;
	const remote_host = session.remote_host;
	const username = session.username;
	const port = session.port;
	const session_name = session.session_name;
	const session_description = session.session_description;
	const x11_forwarding = session.x11_forwarding;
	const compression = session.compression;

	console.log(protocol, remote_host, username, port, session_name, session_description, x11_forwarding, compression)

	e_remote_host.value = remote_host;
	e_username.value = username;
	(e_port as any).value = port;

	e_session_name.value = session_name;
	e_session_description.value = session_description;

	e_x11_forwarding.checked = x11_forwarding;
	e_compression.checked = compression;
}

ipcRenderer.once("get-args", (ev, _bookmarkId, _session: SSHSession) => {
	console.log("Got bookmarkId and session:", _bookmarkId, _session)
	bookmarkId = _bookmarkId;
	session = _session;

	updateGUI(session);
});

/**
 * When cancel button clicked
 */
function cancel() {
	window.close()
}

/**
 * When delete button clicked
 */
function deleteClicked() {
	ipcRenderer.send("DeleteBookmark", bookmarkId)
	close()
}

/**
 * When apply button clicked
 */
function submitForm() {
	console.log("Submit form")

	

	//Create template ssh session to send with uuid not set
	let modal: SSHSession = {
		uuid: null,      //uuid is not decided here.

		protocol: "SSH",
		remote_host: e_remote_host.value,
		username: e_username.value,
		port: e_port.valueAsNumber,
		session_name: e_session_name.value,
		session_description: e_session_description.value,
		x11_forwarding: e_x11_forwarding.checked,
		compression: e_compression.checked,
		private_key: e_private_key.checked
	}


	if(e_private_key.checked) {
		//TODO: Get file path from file input
		let filepath = null
		modal.private_key_path = filepath
	}


	//Update bookmark
	ipcRenderer.send("Renderer_BookmarksUI_UpdateBookmark", modal)

	window.close()
}

/**
 * Called when user clicks on Open containing folder for private key file
 */
function openContainingFolder() {
	//TODO: Step 1: Get file path
	//TODO: Step 2: Tell main to open file explorer / windows linux mac with the spesified file

	
}
