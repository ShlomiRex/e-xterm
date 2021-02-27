import { SSHSession } from "../shared/session";

const { ipcRenderer } = require('electron')



//This parameter is set after DOM is loaded from main process.
let session: SSHSession = undefined;

const btn_apply = document.getElementById("apply")
const btn_cancel = document.getElementById("cancel")
const btn_delete = document.getElementById("delete")
const btn_private_key = <HTMLInputElement>document.getElementById("private_key_btn")

const e_remote_host = <HTMLInputElement>document.getElementById("remote_host");
const e_username = <HTMLInputElement>document.getElementById("username");
const e_port = <HTMLInputElement>document.getElementById("port");
const e_x11_forwarding = <HTMLInputElement>document.getElementById("x11_forwarding");
const e_compression = <HTMLInputElement>document.getElementById("compression");
const e_private_key = <HTMLInputElement>document.getElementById("private_key");
const e_private_key_text = <HTMLInputElement>document.getElementById("private_key_file_text");
const e_session_name = <HTMLInputElement>document.getElementById("session_name");
const e_session_description = <HTMLInputElement>document.getElementById("session_description");


btn_apply.onclick = submitForm
btn_cancel.onclick = cancel
btn_delete.onclick = deleteClicked
btn_private_key.onclick = openContainingFolder
e_private_key.onclick = privateKeyCheckboxChanged


let opened_session :SSHSession = undefined
function updateGUI(session: SSHSession) {
	opened_session = session
	//Update the GUI to match the given session (set GUI elements to match the session settings)
	const protocol = session.protocol;
	const remote_host = session.remote_host;
	const username = session.username;
	const port = session.port;
	const session_name = session.session_name;
	const session_description = session.session_description;
	const x11_forwarding = session.x11_forwarding;
	const compression = session.compression;
	const private_key = session.private_key


	e_remote_host.value = remote_host;
	e_username.value = username;
	(e_port as any).value = port;

	e_session_name.value = session_name;
	e_session_description.value = session_description;

	e_x11_forwarding.checked = x11_forwarding;
	e_compression.checked = compression;

	e_private_key.checked = private_key

	//Set private key text field to be the file path
	let private_key_path = session.private_key_path
	if(private_key_path) {
		e_private_key_text.value = private_key_path
	} else {
		e_private_key_text.value = ""
	}

	if(private_key) {
		//Removed disabled elements
		e_private_key_text.disabled = false
		btn_private_key.disabled = false
	}
}

let bookmarkId: string = undefined;
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
		let filepath = e_private_key_text.value
		modal.private_key_path = filepath
	} else {
		modal.private_key_path = opened_session.private_key_path
	}


	//Update bookmark
	ipcRenderer.send("Renderer_BookmarksUI_UpdateBookmark", modal)

	window.close()
}

/**
 * Called when user clicks on Open containing folder for private key file
 */
function openContainingFolder() {
	let private_key_path = e_private_key_text.value
	if(private_key_path.length > 0) {
		ipcRenderer.send("OpenContainingFolder", private_key_path)
	} else {
		console.debug("Cannot open empty containing folder")
	}

}

/**
 * Called when user clicks on the checkbox of private key
 */
function privateKeyCheckboxChanged() {
	let checked = e_private_key.checked
	console.log("Private key clicked")
	if(checked) { 
		//Show content
		e_private_key_text.disabled = false
		btn_private_key.disabled = false
	} else {
		//Disable content
		e_private_key_text.disabled = true
		btn_private_key.disabled = true
	}
}

document.onkeydown = (ev: KeyboardEvent) => {
	if(ev.code == "Escape") {
		cancel()
	}
}