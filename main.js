// this is like the back end, db etc.
const path = require("path");
const { app, BrowserWindow } = require("electron");
const Menu = require("electron").Menu;
const { ipcMain } = require("electron");
const isMac = process.platform === "darwin";
const isDev = process.env.NODE_ENV !== "development";
const os = require("os");
const { dialog, shell } = require("electron");
const fs = require("fs");
const sharp = require("sharp");

let mainWindow;

// create the main window
function createWindow() {
		mainWindow = new BrowserWindow({
		width: 900,
		height: 700,
		title: "Image Resizer",
		icon: "./assets/icons/Icon_256x256.png",
		resizable: isDev,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: true,
			enableRemoteModule: true,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	if (isDev) {
		mainWindow.webContents.openDevTools();
	}

	mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
}

// Create About page
function createAboutWindow() {
	const aboutWindow = new BrowserWindow({
		width: 300,
		height: 300,
		title: "About",
	});

	aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}

// app is ready
app.whenReady().then(() => {
	createWindow();

	// implement menu
	const mainMenu = Menu.buildFromTemplate(menu);
	Menu.setApplicationMenu(mainMenu);
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

// menu template

const menu = [
	...(isMac ? [{ role: "appMenu" }] : []),
	{
		label: "File",
		submenu: [
			{
				label: "Quit",
				accelerator: isMac ? "Command+W" : "Ctrl+W",
				click: () => app.quit(),
			},
			{
				label: "Reload",
				accelerator: isMac ? "Command+R" : "Ctrl+R",
				click: (item, focusedWindow) => focusedWindow.reload(),
			},
			{
				label: "Dev Tools",
				accelerator: isMac ? "Command+I" : "Ctrl+I",
				click: (item, focusedWindow) => focusedWindow.toggleDevTools(),
			},
		],
	},
	{
		label: "About",
		submenu: [
			{
				label: "About",
				click: () => {
					console.log("About Clicked");
					createAboutWindow();
				},
			},
		],
	},
	...(!isMac
		? [
				{
					label: "Exit",
					click: () => app.quit(),
				},
		  ]
		: []),
];

// Respond to IPC Renderer events

ipcMain.on("image:resize", (e, options) => {
	console.log("image:resize received");
	console.log(options);
	resizeImage(options);
});

// resize the image
async function resizeImage(options) {
	const { width, height, imagePath, output } = options;

	const filename = path.basename(imagePath);
	const ext = path.extname(filename);
	const name = path.basename(filename, ext);
	console.log(filename, ext, name);

	// create destination folder if it doesnt exist
	if (!fs.existsSync(output)) {
		fs.mkdirSync(output);
	}

	// resize the image
	sharp(imagePath)
		.resize(parseInt(width), parseInt(height))
		.toFile(output + "/" + name + "-resized" + ext)
		.then((data) => {
			console.log(data);
			// alert("Image resized successfully");
			dialog.showMessageBoxSync({
				title: "Success",
				message: "Image resized successfully",
			});

			// send status to renderer
			mainWindow.webContents.send("image:done", {
				status: "success",
				message: "Image resized successfully",
			});


			// open the output folder
			shell.openPath(output);

		})
		.catch((err) => {
			console.log(err);
			// alert("Error resizing image");
			dialog.showMessageBoxSync({
				title: "Error",
				message: "Error resizing image",
			});
		});
}
