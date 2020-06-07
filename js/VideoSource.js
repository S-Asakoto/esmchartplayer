let VideoSource = null;

function onYouTubeIframeAPIReady() {
	VideoSource = (function() {
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
			loadYouTube(videoId) {
				wasPlaying = false;
				loading = true;
				ytPlayer.cueVideoById(videoId, 0);
			}
		};
	})();
}
