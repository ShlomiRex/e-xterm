const { ipcRenderer, remote } = require('electron')
//var window = remote.getCurrentWindow();

let username_input = <HTMLInputElement>document.getElementById("username");
let pass_input = <HTMLInputElement>document.getElementById("pass");
let pass_text_container = <HTMLInputElement>document.getElementById("pass_text_container")

let username_required: boolean = undefined;
let passphrase_required: boolean = undefined

ipcRenderer.once("get-args", (ev: any, _username_required: boolean, _passphrase_required: boolean) => {
	console.log("get-args, ask for username? ", _username_required)

	username_required = _username_required
	passphrase_required = _passphrase_required

	if(! username_required) {
		pass_input.focus();

		document.getElementById("username_container").remove();
	} else {
		username_input.focus();
	}

	if(passphrase_required) {
		pass_text_container.textContent = "Private key passphrase:"
	}
});

pass_input.addEventListener("keydown", (ev) => {
	console.log("Key pressed:", ev.keyCode)
	if(ev.keyCode == 13) {
		//Enter pressed

		//event.preventDefault();
		submit();
	}
});

function submit() {
	console.log("Submit");
	let username = null;
	const password = pass_input.value;

	if(username_required) {
		username = username_input.value;
	}
	ipcRenderer.send("LoginWindowResult", username, password);
	
	cancel()
}

function cancel() {
	window.close();
}

document.onkeydown = (ev: KeyboardEvent) => {
	if(ev.code == "Escape") {
		cancel()
	}
}