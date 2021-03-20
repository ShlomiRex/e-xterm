import { SSHSession } from "../shared/session";
import { ipcRenderer } from 'electron';

var cmd = require('node-cmd');

const PROTOCOLS = ["SSH", "SFTP", "FTP", "RDP", "VNC", "Telnet", "WSL"]

let current_active_btn_protocol: string = undefined

// Add click event for each button
for (let protocol of PROTOCOLS) {
	let DOM_btn = document.getElementById(`btn_${protocol}`)
	DOM_btn.addEventListener("click", () => {
		console.debug("Clicked on: ", protocol)

		if (current_active_btn_protocol) {
			//Hide current active protocol's content
			document.getElementById(`${current_active_btn_protocol}_settings`).classList.add("hidden");
		}

		//Show hidden content for selected protocol
		document.getElementById(`${protocol}_settings`).classList.remove("hidden");

		current_active_btn_protocol = protocol;
	})
}




const platform = ipcRenderer.sendSync("platform?")
console.log("Platform: ", platform)

const isWindows = platform == "win32"




function setup_SSH_form() {
	const SSH_form = document.getElementById("SSH_form")
	SSH_form.onsubmit = SSH_submit

	const btn_SSH_cancel = document.getElementById("SSH_cancel")
	btn_SSH_cancel.onclick = closeWindow

	const e_private_key_file = <HTMLInputElement>document.getElementById("private_key_file");

	//Called when user clicks on Open containing folder for private key file
	function openContainingFolder() {
		let files = e_private_key_file.files
		if (files.length != 0) {
			ipcRenderer.send("OpenContainingFolder", files[0].path)
		}

	}

	//Called when user clicks on the checkbox of private key
	function privateKeyCheckboxChanged() {
		let checked = e_private_key.checked
		if (checked) {
			//Show content
			e_private_key_file.disabled = false
			btn_private_key.disabled = false
		} else {
			//Disable content
			e_private_key_file.disabled = true
			btn_private_key.disabled = true
		}
	}

	const btn_private_key = <HTMLInputElement>document.getElementById("private_key_btn")
	btn_private_key.onclick = openContainingFolder

	const e_private_key = <HTMLInputElement>document.getElementById("private_key");
	e_private_key.onclick = privateKeyCheckboxChanged

	function SSH_submit() {
		console.log("Submit form: SSH")
		console.log(SSH_form)

		const e_remote_host = <HTMLInputElement>document.getElementById("remote_host");
		const e_username = <HTMLInputElement>document.getElementById("username");
		const e_port = <HTMLInputElement>document.getElementById("port");
		const e_x11_forwarding = <HTMLInputElement>document.getElementById("x11_forwarding");
		const e_compression = <HTMLInputElement>document.getElementById("compression");
		const e_session_name = <HTMLInputElement>document.getElementById("session_name");
		const e_session_description = <HTMLInputElement>document.getElementById("session_description");

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

		if (e_private_key.checked && e_private_key_file.files.length > 0) {
			modal["private_key_path"] = e_private_key_file.files[0].path
		}

		//Save bookmark
		ipcRenderer.send("NewBookmark", modal)

		window.close()
	}
}

function setup_WSL_form() {
	if (!isWindows) {
		//Only windows have WSL.
		let DOM_btn = document.getElementById(`btn_WSL`)
		DOM_btn.remove()
		return
	}

	function populateDistros() {
		const WSL_distro_select = document.getElementById("WSL_distro_select")

		cmd.run(`wsl -l`,
			function (err: any, data: any, stderr: any) {
				if (err) {
					console.error("Error on wsl -l: ", err)
					console.error(stderr)
				} else {
					let newData = data.replace(/\0/g, '') //Remove unicode NULL \u0000, weird shit in windows P_P
					let WSL_distros = newData.split("\n")
					WSL_distros.shift() //Remove first element: `'Windows Subsystem for Linux Distributions:'`
					WSL_distros.pop() //Remove last element: `''`

					for (var distro of WSL_distros) {
						var DOM_option = document.createElement("option")
						DOM_option.innerText = distro
						WSL_distro_select.appendChild(DOM_option)
					}
				}
			}
		);
	}

	//Async function
	populateDistros()

	const WSL_form = document.getElementById("WSL_form")
	WSL_form.onsubmit = WSL_submit

	function WSL_submit() {
		console.log("Submit form: WSL")
		console.log(WSL_form)

		

		closeWindow()
	}
}

function closeWindow() {
	window.close()
}

setup_SSH_form()
setup_WSL_form()



