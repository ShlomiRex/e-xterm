export interface SSHSession {
	protocol: string,
	remote_host: string,
	username: string,
	port: number,
	session_name: string,
	session_description: string
	x11_forwarding: boolean,
	compression: boolean
};


export class MyBookmarks {
	private sessions: Array<SSHSession>
	private uiParent: HTMLElement

	/**
	 * 
	 * @param sessions The sessions to populate
	 * @param uiParent The UI to populate bookmarks
	 */
	constructor(sessions: Array<SSHSession>, uiParent: HTMLElement) {
		this.sessions = sessions;
		this.uiParent = uiParent;

		for(var session of sessions) {
			this.populate(session);
		}
	}

	/**
	 * Add bookmarks to ui
	 * @param session Session to populate
	 */
	populate(session: SSHSession) {
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
		bookmark_item.className = "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
		bookmark_item.setAttribute("data-bs-toggle", "list");
		bookmark_item.setAttribute("role", "tab");
		bookmark_item.setAttribute("aria-controls", name); //Accessability for screen readers
		bookmark_item.innerText = name;
		//This makes cursor look like clicking
		bookmark_item.setAttribute("href", "");

		bookmark_item.addEventListener("click", () => {
			/*
			console.log("Clicked " + name)
			const win = new BrowserWindow({ 
				width: 400, 
				height: 200,
				webPreferences: {
					nodeIntegration: true,
					enableRemoteModule: true
				}
			})

			win.loadFile(path.join(__dirname, '../html/password.html'))
			*/
		});

		var badge = document.createElement("span");
		badge.className = "badge rounded-pill";
		badge.innerText = protocol;
		badge.setAttribute("style", "background-color:black; color: white;");

		bookmark_item.appendChild(badge);

		this.uiParent.appendChild(bookmark_item);
	}
	
};