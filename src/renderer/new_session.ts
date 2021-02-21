import { SSHSession } from "../shared/session";

const { ipcRenderer } = require('electron')


const PROTOCOLS = ["SSH", "SFTP", "FTP", "RDP", "VNC", "Telnet", "WSL"]


for(let protocol of PROTOCOLS) {
	document.getElementById(protocol).addEventListener("click", () => {
		//Show hidden content for selected protocol
		document.getElementById("hidden_content_" + protocol).style.display = "block";
	})
}




const form = document.getElementById("form")

const btn_submit = document.getElementById("submit")
const btn_cancel = document.getElementById("cancel")
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

form.onsubmit = submitForm
btn_cancel.onclick = cancel
btn_private_key.onclick = openContainingFolder

function cancel() {
	window.close()
}

function submitForm() {
	console.log("Submit form")

	const form = document.getElementById("form")
	console.dir(form);

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

	//Save bookmark
	const { ipcRenderer } = require('electron')
	ipcRenderer.send("NewBookmark", modal)

	window.close()
}


/**
 * Called when user clicks on Open containing folder for private key file
 */
function openContainingFolder() {
	let files = e_private_key_file.files
	if (files.length != 0) {
		ipcRenderer.send("OpenContainingFolder", files[0].path)
	}

}
