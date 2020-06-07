const Globals = (function() {
	const wordings = {
		VIDEO_SETTINGS: {
			"zh-Hant": "影片設定",
			"zh-Hans": "视频设定",
			"en": "Video Settings",
			"ja": "動画設定"
		},
		LOAD: {
			"zh-Hant": "載入",
			"zh-Hans": "加载",
			"en": "Load",
			"ja": "読み込み"
		}, 
		SOURCE: {
			"zh-Hant": "來源",
			"zh-Hans": "来源",
			"en": "Source",
			"ja": "ソース"
		}, 
		BRIGHTNESS: {
			"zh-Hant": "亮度",
			"zh-Hans": "亮度",
			"en": "Brightness",
			"ja": "明るさ"
		}, 
		VOLUME: {
			"zh-Hant": "音量",
			"zh-Hans": "音量",
			"en": "Volume",
			"ja": "音量"
		}, 
		CLOSE_N_PLAY: {
			"zh-Hant": "關閉並播放",
			"zh-Hans": "关闭并播放",
			"en": "Close &amp; Play",
			"ja": "閉じて再生"
		}, 
		PLAYBACK_SETTINGS: {
			"zh-Hant": "譜面播放設定",
			"zh-Hans": "谱面播放设定",
			"en": "Chart Player Settings",
			"ja": "譜面再生設定"
		}, 
		LOAD_SUCCESS: {
			"zh-Hant": "載入成功",
			"zh-Hans": "加载成功",
			"en": "Loading succeeded",
			"ja": "読み込み成功"
		}, 
		LOAD_FAILED: {
			"zh-Hant": "載入失敗",
			"zh-Hans": "加载失败",
			"en": "Loading failed",
			"ja": "読み込み失敗"
		}, 
		FULLSCREEN: {
			"zh-Hant": "全螢幕模式",
			"zh-Hans": "全屏模式",
			"en": "Fullscreen Mode",
			"ja": " フルスクリーンモード"
		}, 
		DISABLED: {
			"zh-Hant": "停用",
			"zh-Hans": "禁用",
			"en": "Disabled",
			"ja": "オフ"
		}, 
		ENABLED: {
			"zh-Hant": "啟用",
			"zh-Hans": "启用",
			"en": "Enabled",
			"ja": "オン"
		}, 
		HI_SPEED: {
			"zh-Hant": "譜面速度",
			"zh-Hans": "谱面速度",
			"en": "Hi-speed",
			"ja": "ハイスピード"
		}, 
		NOTE_SIZE: {
			"zh-Hant": "音符大小",
			"zh-Hans": "音符大小",
			"en": "Note Size",
			"ja": "ノーツの大きさ"
		}, 
		LANGUAGE: {
			"zh-Hant": "語言",
			"zh-Hans": "语言",
			"en": "Language",
			"ja": "言語"
		}, 
		COMBO_POSITION: {
			"zh-Hant": "連擊顯示位置",
			"zh-Hans": "连击显示位置",
			"en": "Combo Display Position",
			"ja": "コンボ表示位置"
		}, 
		TOP_CENTER: {
			"zh-Hant": "正上方",
			"zh-Hans": "正上方",
			"en": "Top Center",
			"ja": "中央上"
		}, 
		BOTTOM_CENTER: {
			"zh-Hant": "正下方",
			"zh-Hans": "正下方",
			"en": "Bottom Center",
			"ja": "中央下"
		}, 
		TOP_RIGHT: {
			"zh-Hant": "右上角",
			"zh-Hans": "右上⻆",
			"en": "Top Right",
			"ja": "右上"
		},
		JUDGE_POSITION: {
			"zh-Hant": "判定顯示位置",
			"zh-Hans": "判定显示位置",
			"en": "Judgment Display Position",
			"ja": "判定表示位置"
		}, 
		TOP: {
			"zh-Hant": "上方",
			"zh-Hans": "上方",
			"en": "Top",
			"ja": "上"
		}, 
		CENTER: {
			"zh-Hant": "正中",
			"zh-Hans": "正中",
			"en": "Center",
			"ja": "中央"
		}, 
		BOTTOM: {
			"zh-Hant": "下方",
			"zh-Hans": "下方",
			"en": "Bottom",
			"ja": "下"
		},
		HIDDEN: {
			"zh-Hant": "隱藏",
			"zh-Hans": "隐藏",
			"en": "Hidden",
			"ja": "非表示"
		}, 
		PLAY_MODE: {
			"zh-Hant": "遊玩模式",
			"zh-Hans": "游玩模式",
			"en": "Play Mode",
			"ja": "プレイモード"
		}, 
		UNIT_SETTINGS: {
			"zh-Hant": "隊伍設定",
			"zh-Hans": "队伍设定",
			"en": "Unit Settings",
			"ja": "ユニット設定"
		}, 
		TOTAL_STRENGTH: {
			"zh-Hant": "綜合值",
			"zh-Hans": "综合值",
			"en": "Total Strength",
			"ja": "総合値"
		}, 
		LIVE_SKILLS: {
			"zh-Hant": "演出技能",
			"zh-Hans": "演出技能",
			"en": "Live Skills",
			"ja": "ライブスキル"
		}, 
		SUPPORT_SKILLS: {
			"zh-Hant": "支援技能",
			"zh-Hans": "支援技能",
			"en": "Support Skills",
			"ja": "サポートスキル"
		}, 
		NTH_POSITION: {
			"zh-Hant": "{0}號位",
			"zh-Hans": "{0}号位",
			"en": "Position {0}",
			"ja": "{0}番"
		}, 
		CENTER_POSITION: {
			"zh-Hant": "隊長位",
			"zh-Hans": "队长位",
			"en": "Center",
			"ja": "センター"
		}, 
		IN_SECONDS: {
			"zh-Hant": "{0}秒之內",
			"zh-Hans": "{0}秒之内",
			"en": "For {0} seconds",
			"ja": "{0}秒間"
		}, 
		OFFSET: {
			"zh-Hant": "譜面延遲",
			"zh-Hans": "谱面延迟",
			"en": "Chart Offset",
			"ja": "オフセット"
		}, 
		CHART_ERROR: {
			"zh-Hant": "譜面載入失敗。錯誤詳細︰\n",
			"zh-Hans": "谱面加载失败。错误详细：\n",
			"en": "Failed loading the chart. Error details:\n",
			"ja": "譜面の読み込みに失敗しました。エラー詳細：\n"
		}, 
		CHART_SETTINGS: {
			"zh-Hant": "譜面設定",
			"zh-Hans": "谱面设定",
			"en": "Chart Settings",
			"ja": "譜面設定"
		}, 
		CHART_DIFFICULTY: {
			"zh-Hant": "譜面難度",
			"zh-Hans": "谱面难度",
			"en": "Chart Difficulty",
			"ja": "譜面難易度"
		}, 
		CHART_CONTENT: {
			"zh-Hant": "譜面內容",
			"zh-Hans": "谱面内容",
			"en": "Chart Content",
			"ja": "譜面內容"
		}, 
		_: {
			"zh-Hant": "",
			"zh-Hans": "",
			"en": "",
			"ja": ""
		}, 
		_: {
			"zh-Hant": "",
			"zh-Hans": "",
			"en": "",
			"ja": ""
		}
	}
	
	function getTranslation(key, lang, replaces) {
		replaces = replaces instanceof Array ? replaces : [];
		if (!(key in wordings))
			return "";
		if (!(lang in wordings._))
			return "";
		return wordings[key][lang].replace(/\{(\d+)\}/g, function(a, b) {
			return replaces[b] || "";
		});
	}
	
	return {
		getTranslation,
		setTranslation(lang) {
			$("*[data-translate]").each(function() {
				let replaces = [];
				try {
					replaces = JSON.parse(this.dataset.replaces);
					if (!replaces instanceof Array)
						replaces = [];
				}
				catch (e) {}
				this.innerHTML = getTranslation(this.dataset.translate, lang, replaces) || this.innerHTML;
			});
		}
	};
})();
