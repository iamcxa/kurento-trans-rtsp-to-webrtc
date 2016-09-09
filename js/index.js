/*
 * (C) Copyright 2014 Kurento (http://kurento.org/)
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the GNU Lesser General Public License
 * (LGPL) version 2.1 which accompanies this distribution, and is available at
 * http://www.gnu.org/licenses/lgpl-2.1.html
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 */

function getopts(args, opts) {
	var result = opts.default || {};
	args.replace(
		new RegExp("([^?=&]+)(=([^&]*))?", "g"),
		function ($0, $1, $2, $3) {
			result[$1] = $3;
		});

	return result;
};

var args = getopts(location.search, {
	default: {
		ws_uri: 'ws://' + location.hostname + ':8888/kurento',
		ice_servers: undefined
	}
});

if (args.ice_servers) {
	console.log("Use ICE servers: " + args.ice_servers);
	kurentoUtils.WebRtcPeer.prototype.server.iceServers = JSON.parse(args.ice_servers);
} else {
	console.log("Use freeice")
}

window.addEventListener('load', function () {
	// disable this if needs
	console = new Console('console', console);
	var videoOutput = document.getElementById('videoOutput');
	var pipeline;
	var webRtcPeer;
	var address = document.getElementById('address');
	address.value = 'rtsp://mpv.cdn3.bigCDN.com:554/bigCDN/definst/mp4:bigbuckbunnyiphone_400.mp4';

	startButton = document.getElementById('start');
	startButton.addEventListener('click', start);

	stopButton = document.getElementById('stop');
	stopButton.addEventListener('click', stop);

	var snapshotButton = document.getElementById('snapshot');
	snapshotButton.addEventListener('click', generate);

	function start() {
		if (!address.value) {
			window.alert("You must set the video source URL first");
			return;
		}
		address.disabled = true;
		showSpinner(videoOutput);
		var constraints = {
			audio: true,
			video: {
				width: 480,
				framerate: 15
			}
		};
		var options = {
			remoteVideo: videoOutput,
			// mediaConstraints: constraints
		};
		webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
			function (error) {
				if (error) {
					return console.error(error);
				}
				webRtcPeer.generateOffer(onOffer);
				webRtcPeer.peerConnection.addEventListener('iceconnectionstatechange', function (event) {
					if (webRtcPeer && webRtcPeer.peerConnection) {
						console.log("oniceconnectionstatechange -> " + webRtcPeer.peerConnection.iceConnectionState);
						console.log('icegatheringstate -> ' + webRtcPeer.peerConnection.iceGatheringState);
					}
				});
			});
	}

	function onOffer(error, sdpOffer) {
		if (error) {
			console.log('onOffer');
			return onError(error);
		}

		try {

			kurentoClient(args.ws_uri, function (error, kurentoClient) {
				if (error) {
					console.log('onOffer');
					return onError(error);
				}

				kurentoClient.create("MediaPipeline", function (error, p) {
					if (error) {
						console.log('onOffer');
						return onError(error);
					}

					pipeline = p;

					pipeline.create("PlayerEndpoint", {
						uri: address.value
					}, function (error, player) {
						if (error) return onError(error);

						pipeline.create("WebRtcEndpoint", function (error, webRtcEndpoint) {
							if (error) return onError(error);

							setIceCandidateCallbacks(webRtcEndpoint, webRtcPeer, onError);

							webRtcEndpoint.processOffer(sdpOffer, function (error, sdpAnswer) {
								if (error) return onError(error);

								webRtcEndpoint.gatherCandidates(onError);

								webRtcPeer.processAnswer(sdpAnswer);
							});

							player.connect(webRtcEndpoint, function (error) {
								if (error) return onError(error);

								console.log('!!!!!!!!!=>', webRtcEndpoint);
								console.log("PlayerEndpoint-->WebRtcEndpoint connection established");

								player.play(function (error) {
									if (error) return onError(error);

									console.log("Player playing ...");
								});
							});
						});
					});
				});
			});
		} catch (e) {
			console.log('e=>', e);
		}
	}

	function stop() {
		address.disabled = false;
		if (webRtcPeer) {
			webRtcPeer.dispose();
			webRtcPeer = null;
		}
		if (pipeline) {
			pipeline.release();
			pipeline = null;
		}
		hideSpinner(videoOutput);
	}

});

function setIceCandidateCallbacks(webRtcEndpoint, webRtcPeer, onError) {
	webRtcPeer.on('icecandidate', function (candidate) {
		console.log("Local icecandidate " + JSON.stringify(candidate));

		candidate = kurentoClient.register.complexTypes.IceCandidate(candidate);

		webRtcEndpoint.addIceCandidate(candidate, onError);

	});
	webRtcEndpoint.on('OnIceCandidate', function (event) {
		var candidate = event.candidate;

		console.log("Remote icecandidate " + JSON.stringify(candidate));

		webRtcPeer.addIceCandidate(candidate, onError);
	});
}

function onError(error) {
	if (error) {
		console.error(error);
		stop();
	}
}

function showSpinner() {
	for (var i = 0; i < arguments.length; i++) {
		arguments[i].poster = 'img/transparent-1px.png';
		arguments[i].style.background = "center transparent url('img/spinner.gif') no-repeat";
	}
}

function hideSpinner() {
	for (var i = 0; i < arguments.length; i++) {
		arguments[i].src = '';
		arguments[i].poster = 'img/webrtc.png';
		arguments[i].style.background = '';
	}
}

/**
 * Lightbox utility (to display media pipeline image in a modal dialog)
 */
$(document).delegate('*[data-toggle="lightbox"]', 'click', function (event) {
	event.preventDefault();
	$(this).ekkoLightbox();
});


(function (exports) {
	function urlsToAbsolute(nodeList) {
		if (!nodeList.length) {
			return [];
		}
		var attrName = 'href';
		if (nodeList[0].__proto__ === HTMLImageElement.prototype || nodeList[0].__proto__ === HTMLScriptElement.prototype) {
			attrName = 'src';
		}
		nodeList = [].map.call(nodeList, function (el, i) {
			var attr = el.getAttribute(attrName);
			if (!attr) {
				return;
			}
			var absURL = /^(https?|data):/i.test(attr);
			if (absURL) {
				return el;
			} else {
				return el;
			}
		});
		return nodeList;
	}

	function screenshotPage() {
		urlsToAbsolute(document.images);
		urlsToAbsolute(document.querySelectorAll("link[rel='stylesheet']"));
		var screenshot = document.documentElement.cloneNode(true);
    // var screenshot = document.getElementById('videoOutput_html5_api').cloneNode(true);
		var b = document.createElement('base');
		b.href = document.location.protocol + '//' + location.host;
		var head = screenshot.querySelector('head');
		head.insertBefore(b, head.firstChild);
		screenshot.style.pointerEvents = 'none';
		screenshot.style.overflow = 'hidden';
		screenshot.style.webkitUserSelect = 'none';
		screenshot.style.mozUserSelect = 'none';
		screenshot.style.msUserSelect = 'none';
		screenshot.style.oUserSelect = 'none';
		screenshot.style.userSelect = 'none';
		screenshot.dataset.scrollX = window.scrollX;
		screenshot.dataset.scrollY = window.scrollY;
		var script = document.createElement('script');
		script.textContent = '(' + addOnPageLoad_.toString() + ')();';
		screenshot.querySelector('body').appendChild(script);
		var blob = new Blob([screenshot.outerHTML], {
			type: 'text/html'
		});
		return blob;
	}

	function addOnPageLoad_() {
		window.addEventListener('DOMContentLoaded', function (e) {
			var scrollX = document.documentElement.dataset.scrollX || 0;
			var scrollY = document.documentElement.dataset.scrollY || 0;
			window.scrollTo(scrollX, scrollY);
		});
	}

	function generate() {
		window.URL = window.URL || window.webkitURL;
		window.open(window.URL.createObjectURL(screenshotPage()));
	}
	exports.screenshotPage = screenshotPage;
	exports.generate = generate;
})(window);
