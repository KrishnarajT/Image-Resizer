const os = require("os");
const path = require("path");

const { contextBridge, ipcRenderer } = require("electron");
const toastify = require("toastify-js");

contextBridge.exposeInMainWorld("toast", {
    success: (msg) => {
        toastify({
			text: msg,
			duration: 3000,
			close: false,
			gravity: "top",
			position: "right",
			style: {
				backgroundColor: "#00b09b",
				color: "#fff",
				textAlign: "center",
			},
			stopOnFocus: true,
		}).showToast();
    },
    error: (msg) => {
        toastify({
            text: msg,
            duration: 3000,
            close: false,
            gravity: "top",
            position: "right",
            style: {
                backgroundColor: "#ed6f6f",
                color: "#fff",
                textAlign: "center",
            },
            stopOnFocus: true,
        }).showToast();
    },
});

contextBridge.exposeInMainWorld("os", {
	homedir: () => os.homedir(),
	tmpdir: () => os.tmpdir(),
	platform: () => os.platform(),
	type: () => os.type(),
	release: () => os.release(),
	arch: () => os.arch(),
	cpus: () => os.cpus(),
	endianness: () => os.endianness(),
	freemem: () => os.freemem(),
	totalmem: () => os.totalmem(),
	networkInterfaces: () => os.networkInterfaces(),
});

contextBridge.exposeInMainWorld("path", {
	join: (...args) => path.join(...args),
	resolve: () => path.resolve,
	basename: () => path.basename,
	dirname: () => path.dirname,
	extname: () => path.extname,
	parse: () => path.parse,
	format: () => path.format,
	sep: () => path.sep,
	delimiter: () => path.delimiter,
	win32: () => path.win32,
	posix: () => path.posix,
});

contextBridge.exposeInMainWorld("ipcRenderer", {
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    on: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
});
