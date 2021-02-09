// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.

import { SSHSession } from "./session";
import { ipcRenderer } from 'electron';

//Remember, require is not defined!!!



//const API: any = (window as any).api



document.getElementById("btn_newSession").addEventListener("click", (ev: MouseEvent) => {
	//API.clickedOnNewSession()
});


/**
 * Add bookmarks to ui
 * @param session Session to populate
 */
function populate(session: SSHSession) {
	/*
		Example to create:
		<a class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
			id="list-home-list" data-bs-toggle="list" href="#list-home" role="tab"
			aria-controls="home">
			root@10.0.0.9
			<span class="badge rounded-pill"
				style="background-color:black; color: white;">SSH</span>
		</a>
	*/


	var name = session.session_name;
	//If user did not give session name, use the hostname instead
	if (!name) {
		if (session.username) {
			name = session.username + "@" + session.remote_host;
		} else {
			name = session.remote_host;
		}
	}

	var protocol = session.protocol;
	console.log("Loading session: " + name + " protocol: " + protocol);

	var bookmark_item = document.createElement("a");
	bookmark_item.className = "bookmarks-item list-group-item list-group-item-action d-flex justify-content-between align-items-center";
	bookmark_item.setAttribute("data-bs-toggle", "list");
	bookmark_item.setAttribute("role", "tab");
	bookmark_item.setAttribute("aria-controls", name); //Accessability for screen readers
	bookmark_item.innerText = name;


	function createElementFromHTML(htmlString: string): HTMLElement {
		var div: any = document.createElement('div');
		div.innerHTML = htmlString.trim();

		// Change this to div.childNodes to support multiple top-level nodes
		return div.firstChild;
	}

	//This makes cursor look like clicking
	//bookmark_item.setAttribute("href", "");

	let bookmark_id = session.session_id
	bookmark_item.setAttribute("data-bookmark-id", "" + bookmark_id)

	bookmark_item.addEventListener("click", () => {
		//TODO: Choose something to do
	});

	function getBookmarkIdFromMouseEvent(ev: any) {
		//Traverse path and find the bookmarkId
		//User can click on the pill element / not directly on the text. So we traverse path
		let bid = undefined;
		for (var path of ev.path) {
			if (path.hasAttribute("data-bookmark-id")) {
				bid = parseInt(path.getAttribute("data-bookmark-id"))
				break
			}
		}
		return bid
	}

	bookmark_item.addEventListener("dblclick", (ev: MouseEvent) => {
		let bid = getBookmarkIdFromMouseEvent(ev)
		console.log("Double click on bookmarkId: ", bid)
		let session = this.sessions[bid]
		this.callback(session)
	});

	let gear_image: HTMLElement = createElementFromHTML("<img class='hide settings-icon' src='../resources/gear.svg' alt='Settings'>");
	gear_image.onclick = (ev: MouseEvent) => {
		let bookmarkId: number = getBookmarkIdFromMouseEvent(ev);
		if (bookmarkId != null) {
			let sshSession: SSHSession = this.sessions[bookmarkId];
			console.log("Clicked on settings for bookmarkId: ", bookmarkId)
			ipcRenderer.send("OpenBookmarkSettings", bookmarkId, sshSession)
		} else {
			console.error("Could not find bookmarkId")
		}


	};

	var badge = document.createElement("span");
	badge.className = "badge rounded-pill";
	badge.innerText = protocol;
	badge.setAttribute("style", "background-color:black; color: white;");

	let right_div: HTMLElement = document.createElement("div");

	right_div.appendChild(gear_image);
	right_div.appendChild(badge);

	bookmark_item.appendChild(right_div);

	this.uiParent.appendChild(bookmark_item);
}