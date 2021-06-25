# e-xterm
Cross-platform (Windows, Mac, Linux) electron based SSH client, with managed bookmarks, and tab system for managing sessions. 

And most exciting for me is SFTP browser support - which you can drag and drop files and view remote files while SSH into it.

And lastly, remote monitoring tools, such as CPU %, RAM %, DISK %, all in one package.

Supported terminals for windows: **CMD, Powershell**

Supported terminals for linux: **Bash, ZSH, and more**

Note: This project is in the very early stages.

# Screenshots


## New UI

![](./README-resources/new_ui_1.png)

![](./README-resources/new_ui_2.png)

![](./README-resources/new_ui_3.png)

## Old UI

![](./README-resources/screenshot.png "Ubuntu VM and bookmark settings")

![](./README-resources/powershell.png "Powershell winfetch")

# Supported protocols

| Protocol | Support            | Options                                                                                 |
| -------- | ------------------ | --------------------------------------------------------------------------------------- |
| SSH      | :heavy_check_mark: | <ul><li>Compression</li><li>X11-Forwarding</li><li>Private key authentication</li></ul> |
| WSL      | :heavy_check_mark: | All available distrobutions (Ubuntu, Debian, Kali, ...)                                 |
| VNC      | :x:                | Currently in development                                                                |
| FTP      | :x:                | Currently in development                                                                |
| SFTP     | :x:                | Currently in development                                                                |
| RDP      | :x:                | Currently in development                                                                |
| Telnet   | :x:                | Currently in development                                                                |



## How to run
```
$ npm start
```

## How to download submodules in third-party directory

`$ git clone --recursive https://github.com/ShlomiRex/e-xterm`

If you have problems with node-pty NODE_MODULE_VERSION, then run:
`$ .\node_modules\.bin\electron-rebuild`
to fix the errors.
