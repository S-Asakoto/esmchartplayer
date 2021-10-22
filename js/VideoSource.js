function _local(tag) {
	let loading = false, wasPlaying = false;
	let loadedFile = "";
	let playerDOM = document.getElementById(tag);
	let player = {
		getCurrentTime() {
			return playerDOM.currentTime || 0;
		},
		setVolume(v) {
			playerDOM.volume = v;
		},
		stopVideo() {
			playerDOM.pause();
		},
		seekTo(time) {
			playerDOM.load();
		},
		playVideo() {}
	};

	playerDOM.oncanplaythrough = function() {
		console.log('can play; loading', loading);
		if (loading) {
			alert(Globals.getTranslation("LOAD_SUCCESS", document.documentElement.lang));
			loading = false;
		}
		else {
			playerDOM.play();
			mainLoop();
		}
	};
	playerDOM.onerror = function() {
		alert(Globals.getTranslation("LOAD_FAILED", document.documentElement.lang));
	};
	playerDOM.onended = playerDOM.onpause = function() {
		stopLoop(false);
	};

	return {
		get player() {
			return player;
		},
		loadSource(src) {
			if (src != loadedFile)
				URL.revokeObjectURL(loadedFile);
			loading = true;
			playerDOM.pause();
			$("source", playerDOM).attr("src", loadedFile = src);
			playerDOM.load();
		}
	}
}

let VideoSource = null;
let YouTubeVideoSource = null;
let LocalVideoSource = _local("local_video");
let LocalAudioSource = _local("local_audio");

function onYouTubeIframeAPIReady() {
	YouTubeVideoSource = (function() {
		let initialized = false, loading = false, wasPlaying = false;
		let ytPlayer = new YT.Player("yt", {
			height: "1024",
			width: "576",
			videoId: "",
			events: {
				onReady(e) {
					initialized = true;
					ytPlayer.setVolume(100);
				},
				onStateChange(e) {
					if (e.data == 5) {
						if (loading) {
							alert(Globals.getTranslation("LOAD_SUCCESS", document.documentElement.lang));
							loading = false;
						}
						else if (wasPlaying)
							stopLoop(false);
						
						wasPlaying = false;
					}
					else if (e.data == 1) {
						wasPlaying = true;
						mainLoop();
					}
					else if (e.data == 0)
						stopLoop(false);
				},
				onError(e) {
					if (initialized)
						alert(Globals.getTranslation("LOAD_FAILED", document.documentElement.lang));
				}
			},
			playerVars: {
				autoplay: 0,
				controls: 0,
				disablekb: 1,
				rel: 0,
				playsinline: 1,
				listType: "playlist",
				playlist: ""
			}
		});

		return {
			get player() {
				return ytPlayer;
			},
			loadSource(videoId) {
				wasPlaying = false;
				loading = true;
				ytPlayer.cueVideoById(videoId, 0);
			}
		};
	})();
	if (VideoSource == null)
		VideoSource = YouTubeVideoSource;
}