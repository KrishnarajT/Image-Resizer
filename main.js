// this is like the back end, db etc.
const path = require("path");
const { app, BrowserWindow } = require("electron");

const isMac = process.platform === "darwin";
const isDev = process.env.NODE_ENV !== "development";

function createWindow() {
	const mainWindow = new BrowserWindow({
		width: 900,
		height: 700,
	});

	if (isDev) {
		mainWindow.webContents.openDevTools();
	}

	mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
}

app.whenReady().then(() => {
	createWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on(!isMac ? "window-all-closed" : "before-quit", () => {
	if (!isMac) {
		app.quit();
	}
});
