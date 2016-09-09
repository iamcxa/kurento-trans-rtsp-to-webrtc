var vidControls = (function () {
	console.log("VIDCONTROL START");

	var css =
		'#video-container{background:#eee;width:480px;height:360px;overflow:hidden;position:relative;}' +
		'#ideo-container span{font-size:20px;color:#666;display:block;padding:2em;}' +
		'video{width:480px;height:360px;position:absolute;top:0;left:0;}'+
	'change button{width:50px;border:none;background:#333;color:wheat;}';
	head = document.head || document.getElementsByTagName('head')[0],
		style = document.createElement('style');

	style.type = 'text/css';
	if (style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		style.appendChild(document.createTextNode(css));
	}
	head.appendChild(style);


	/* predefine zoom and rotate */
	var zoom = 1,
		rotate = 0;

	/* Grab the necessary DOM elements */
	var stage = document.getElementById('video-container'),
		v = document.getElementsByTagName('video')[0],
		controls = document.getElementById('video-controls');

	/* Grab the necessary DOM elements */
	var stage = document.getElementById('video-container'),
		v = document.getElementsByTagName('video')[0],
		controls = document.getElementById('video-controls');



	/* If there is a controls element, add the player buttons */
	/* TODO: why does Opera not display the rotation buttons? */
	if (controls) {
		// controls.innerHTML = controls.innerHTML +
		var controllers = document.createElement("change");
		controllers.innerHTML =
			'<div class="col col-md-12">' +
			'<button class="zoomin">+</button>' +
			'<button class="zoomout">-</button>' +
			'<button class="left">⇠</button>' +
			'<button class="right">⇢</button>' +
			'<button class="up">⇡</button>' +
			'<button class="down">⇣</button>' +
			'<button class="rotateleft">&#x21bb;</button>' +
			'<button class="rotateright">&#x21ba;</button>' +
			'<button class="reset">reset</button>' +
			'</div>';
		controls.insertAdjacentElement('beforeend', controllers)
	}

	/* Array of possible browser specific settings for transformation */
	var properties = ['transform', 'WebkitTransform', 'MozTransform',
	                    'msTransform', 'OTransform'],
		prop = properties[0];

	/* Iterators and stuff */
	var i, j, t;

	/* Find out which CSS transform the browser supports */
	for (i = 0, j = properties.length; i < j; i++) {
		if (typeof stage.style[properties[i]] !== 'undefined') {
			prop = properties[i];
			break;
		}
	}

	/* Position video */
	v.style.left = 0;
	v.style.top = 0;

	/* If a button was clicked (uses event delegation)...*/
	controls.addEventListener('click', function (e) {
		t = e.target;
		if (t.nodeName.toLowerCase() === 'button') {

			/* Check the class name of the button and act accordingly */
			switch (t.className) {

				/* Increase zoom and set the transformation */
			case 'zoomin':
				zoom = zoom + 0.1;
				v.style[prop] = 'scale(' + zoom + ') rotate(' + rotate + 'deg)';
				break;

				/* Decrease zoom and set the transformation */
			case 'zoomout':
				zoom = zoom - 0.1;
				v.style[prop] = 'scale(' + zoom + ') rotate(' + rotate + 'deg)';
				break;

				/* Increase rotation and set the transformation */
			case 'rotateleft':
				rotate = rotate + 5;
				v.style[prop] = 'rotate(' + rotate + 'deg) scale(' + zoom + ')';
				break;
				/* Decrease rotation and set the transformation */
			case 'rotateright':
				rotate = rotate - 5;
				v.style[prop] = 'rotate(' + rotate + 'deg) scale(' + zoom + ')';
				break;

				/* Move video around by reading its left/top and altering it */
			case 'left':
				v.style.left = (parseInt(v.style.left, 10) - 5) + 'px';
				break;
			case 'right':
				v.style.left = (parseInt(v.style.left, 10) + 5) + 'px';
				break;
			case 'up':
				v.style.top = (parseInt(v.style.top, 10) - 5) + 'px';
				break;
			case 'down':
				v.style.top = (parseInt(v.style.top, 10) + 5) + 'px';
				break;

				/* Reset all to default */
			case 'reset':
				zoom = 1;
				rotate = 0;
				v.style.top = 0 + 'px';
				v.style.left = 0 + 'px';
				v.style[prop] = 'rotate(' + rotate + 'deg) scale(' + zoom + ')';
				break;
			}
			zoomScale = zoom;
			e.preventDefault();
		}
	}, false);
})();
