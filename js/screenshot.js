var SCREENSHOTS = (function () {
	console.log("SCREENSHOTS START");

	var css = '#screenshot-container{background:#eee;width:480px;height:360px;overflow:hidden;position:relative;}';
	var head = document.head || document.getElementsByTagName('head')[0];
	var style = document.createElement('style');
	style.type = 'text/css';
	style.appendChild(document.createTextNode(css));
	head.appendChild(style);

	// find controlbar
	var controls = document.getElementById('video-controls');
	var v = document.getElementsByTagName('video')[0];

	// insert controls into seekbar
	var controllerContainer = document.createElement("screenshot");
	controllerContainer.innerHTML =
		'<button id="screenshot-button" class="btn btn-info">Create Screenshot</button>' +
		'<div class="col col-md-4">' +
		'<input type="range" id="size" min="0.5" max="4" step="0.5" value="1">' +
		'<span id="screenshotsize">1</span>' +
		'</div>';
	controls.insertAdjacentElement('beforeend', controllerContainer);

	var stage = document.getElementById('screenshot-container');
	var imageContainer = document.createElement('image');
	imageContainer.innerHTML = '<img id="image" style="clear:both;display:none;width: 100%;height: 100%;">';
	stage.insertAdjacentElement('beforeend', imageContainer);

	//for screenshot options and creation
	var image = document.getElementById('image');
	var size = document.getElementById("size");
	var screenshotsize = document.getElementById("screenshotsize");

	//control size of screenshot
	size.addEventListener('change', function () {
		var s = this.value;
		screenshotsize.innerHTML = s;
	}, false);

	var screenshot = document.getElementById('screenshot-button');
	screenshot.addEventListener('click', function () {

		//grab current video frame and put it into a canvas element, consider screenshotsize
		canvas = document.createElement("canvas");
		var context = canvas.getContext('2d');

		var aspectRatio = v.clientHeight / v.clientWidth;
		console.log('aspectRatio=>', aspectRatio);

		var w = v.clientWidth * zoomScale;
		var h = v.clientHeight * zoomScale * aspectRatio;

		canvas.clientWidth = w * size.value * zoomScale;
		canvas.clientHeight = h * size.valueh * zoomScale;

		var zoomW = (zoomScale * w);
		var zoomH = (zoomScale * h);

		var fullW = size.value * zoomW;
		var fullH = size.value * zoomH;

		var scaleX = zoomScale === 1 ? 0 : (zoomW - w) / 6;
		var scaleY = zoomScale === 1 ? 0 : (zoomH - h) / 6;

		console.log('zoomScale=>', zoomScale);
		console.log('drawImage params=>', scaleX, scaleY, zoomW, zoomH, 1 / scaleX, 1 / scaleY, fullW, fullH);

		context.drawImage(v, scaleX, scaleY, zoomW, zoomH, 0, 0, fullW, fullH);

		//lets make a screenshot
		image.width = fullW;
		image.height = fullH;
		image.style.width = fullW + 'px';
		image.style.height = fullH + 'px';
		image.src = canvas.toDataURL();
		image.style.display = "block";

	}, false);
})();
