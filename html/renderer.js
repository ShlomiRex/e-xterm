const ElectronChromeTabs = require("electron-chrome-tabs")
const electronTabs = new ElectronChromeTabs()

electronTabs.addTab("Google", "https://google.com")
electronTabs.addTab("YouTube", "https://youtube.com")
