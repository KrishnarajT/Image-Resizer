// Some JavaScript to load the image and show the form. There is no actual backend functionality. This is just the UI
const form = document.querySelector("#img-form");
const img = document.querySelector("#select-img");
const outputPath = document.querySelector("#output-path");
const fileName = document.querySelector("#filename");
const heightInput = document.querySelector("#height");
const widthInput = document.querySelector("#width");

function sendImage(e) {
	e.preventDefault();

	const width = widthInput.value;
	const height = heightInput.value;
	const imagePath = img.files[0].path;
	const output = outputPath.innerText;

	if (width === "" || height === "") {
		// alert('Please enter a width and height');
		toast.error("Please enter a width and height");
		return;
	}

	if (!img.files[0]) {
		// alert('Please upload an image');
		toast.error("Please upload an image");
		return;
	}

	// send the image to the main process
	ipcRenderer.send("image:resize", {
		width,
		height,
		imagePath,
		output,
  });
  
	console.log("image sent");
	toast.success("Image sent");
}

function loadImage(e) {
	const file = e.target.files[0];

	if (!isFileImage(file)) {
		// alert('Please upload an image file');
		toast.error("Please upload an image file");
		return;
	}
	console.log(file);
	// show the form
	form.classList.remove("hidden");
	form.classList.add("block");
	// set the file name
	fileName.innerHTML = file.name;

	// get the original image size
	const img = new Image();
	img.src = URL.createObjectURL(file);
	img.onload = function () {
		const height = img.height;
		const width = img.width;
		heightInput.value = height;
		widthInput.value = width;
	};

	// get the output path
	outputPath.innerText = path.join(os.homedir(), "imageResizer");
}

// make sure the file is actually an image

function isFileImage(file) {
	const acceptedImageTypes = ["image/gif", "image/jpeg", "image/png"];
	return file && acceptedImageTypes.includes(file["type"]);
}

img.addEventListener("change", loadImage);

form.addEventListener("submit", (e) => {
	sendImage(e);
});
