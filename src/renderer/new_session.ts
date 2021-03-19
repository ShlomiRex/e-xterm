import { SSHSession } from "../shared/session";

const { ipcRenderer } = require('electron')


const PROTOCOLS = ["SSH", "SFTP", "FTP", "RDP", "VNC", "Telnet", "WSL"]

let current_active_btn_protocol: string = undefined

for(let protocol of PROTOCOLS) {
	console.log(protocol)
	let DOM_btn = document.getElementById(`btn_${protocol}`)
	DOM_btn.addEventListener("click", () => {
		console.debug("Clicked on: ", protocol)

		if(current_active_btn_protocol) {
			//Hide current active protocol's content
			document.getElementById(`${current_active_btn_protocol}_settings`).classList.add("hidden");
		}

		//Show hidden content for selected protocol
		document.getElementById(`${protocol}_settings`).classList.remove("hidden");

		current_active_btn_protocol = protocol;
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
e_private_key.onclick = privateKeyCheckboxChanged

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

	if(e_private_key.checked && e_private_key_file.files.length > 0) {
		modal["private_key_path"] = e_private_key_file.files[0].path
	}

	//Save bookmark
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

/**
 * Called when user clicks on the checkbox of private key
 */
function privateKeyCheckboxChanged() {
	let checked = e_private_key.checked
	if(checked) { 
		//Show content
		e_private_key_file.disabled = false
		btn_private_key.disabled = false
	} else {
		//Disable content
		e_private_key_file.disabled = true
		btn_private_key.disabled = true
	}
}