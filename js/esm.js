const checkRegex = /((\d+)#(\d+(\.\d+)?):(\d+(\.\d+)?):(\d+(\.\d+)?))|(([>=])?((((\d+)?:(\d+))?_(\d+))?(\+(\d+(\.\d+)?)\/(\d+(\.\d+)?)|(\.\d+))?|(\d+(\.\d+)?))?([!?~]|@([OSLRUD])?(-?\d+(\.\d+)?)(G(\d+))?))|G(\d+)/gi;
const levelRegex = /((EASY)|(NORMAL)|(HARD)|(EXPERT)|(SPECIAL))_LEVEL_(3[01]|[12][0-9]|0?[1-9])([+]?)/i;
const videoRegex = /v=([A-Za-z0-9-_]{11})/;
const stopRegex = /stop=(\d+(\.\d+)?)/;

let ruler = 0;
// set canvas size
window.onresize = function(e) {
	ruler = window.innerHeight / 100;
	if (window.innerWidth < 1.732 * window.innerHeight)
		ruler = window.innerWidth / 173.2;
	document.documentElement.style.setProperty("--ruler", ruler + "px");

	let exWidth = Math.max(window.innerWidth, window.innerHeight / 0.5625), 
		exHeight = Math.max(window.innerHeight, window.innerWidth * 0.5625);
	$(".external-source").css({
		"width": exWidth + "px",
		"height": exHeight + "px",
		"top": (window.innerHeight - exHeight) / 2 + "px",
		"left": (window.innerWidth - exWidth) / 2 + "px"
	});
	
	let s = document.fullscreenElement || document.mozFullScreenElement 
			|| document.webkitFullscreenElement || document.msFullscreenElement ? "ENABLED" : "DISABLED";
	$("#fs").prop("data-translate", s).html(Globals.getTranslation(s, document.documentElement.lang));
};

let judgmentLine = $("#judgment_line").empty(),
	markTemplate = $("#judgment_mark")[0].content.children[0],
	effectTemplate = $("#effect")[0].content.children[0],
	noteTemplates = $("#notes")[0].content.children,
	simulHints = $("#simul_guide"),
	holdSegments = $("g", "#hold_segments");

function loadJudgmentLine(count) {
	judgmentLine.empty();

	for (let i = 0; i < count; i++) {
		let a = markTemplate.cloneNode(true);

		let angle = (210 + 120 * i / (count - 1)) * Math.PI / 180;
		a.style.top = `calc(50% - ${40 + 80 * Math.sin(angle)} * var(--ruler))`;
		a.style.left = `calc(50% + ${80 * Math.cos(angle)} * var(--ruler))`;
		judgmentLine.append(a);
	}
}

function popTapEffect(position, count, effect) {
	let a = effectTemplate.cloneNode(true);
	let angle = (270 + 120 * position / (count - 1)) * Math.PI / 180;
	a.style.top = `calc(50% - ${40 + 80 * Math.sin(angle)} * var(--ruler))`;
	a.style.left = `calc(50% + ${80 * Math.cos(angle)} * var(--ruler))`;
	judgmentLine.append(a);
	a.children[1].setAttribute("fill", ["#33f8", "#6f68", "#f998", "#fc98"][effect]);
	setTimeout(function() {
		a.remove();
	}, 500);
}

const gradA = $("#grad_a"), gradB = $("#grad_b"), gradC = $("#grad_c"),
 	  gaugeA = $(".gauge-a"), gaugeB = $(".gauge-b"), gaugeC = $(".gauge-c"), gaugeS = $(".gauge-s"), gauge2 = $(".gauge-s2, .gauge-sp"),
	  grads = $(".grads"), gaugeFill = $("#gauge_fill"), scoreGaugeRect = $("rect", "#gauge2"),
	  scoreNum = $("#score_num"), scoreNumBase = $(".base", scoreNum), scoreNumShow = $(".show", scoreNum), scoreUp = $("#score_up"),
	  volGaugeRect = $("rect", "#gauge"),
	  ensGaugeRect = $("#ens_fill"),
	  chartDiffSelect = $("#chart_diff"),
	  noteContainer = $("#note_container"),
	  fpsShow = $("#fps");

function showScore(score, difficulty) {
	let grades = [
		[0, 60000, 200000, 360000, 600000, 1800000],
		[0, 60000, 200000, 360000, 600000, 1800000],
		[0, 66000, 220000, 396000, 660000, 1960000],
		[0, 72000, 240000, 432000, 720000, 2160000],
		[0, 72000, 240000, 432000, 720000, 2160000]
	][difficulty];
	
	$(".gauge-letters").hide();
	if (score < grades[4]) {
		scoreGaugeRect.attr("width", score / grades[4] * 975);
		gaugeFill.attr("fill", "url(#g4)");
		gaugeS.show();
		gaugeA.css({left: `calc(${grades[3] / grades[4] * 97.3 - 1.5} * var(--ruler))`}).show();
		gaugeB.css({left: `calc(${grades[2] / grades[4] * 97.3 - 1.5} * var(--ruler))`}).show();
		gaugeC.css({left: `calc(${grades[1] / grades[4] * 97.3 - 1.5} * var(--ruler))`}).show();
		grads.show();
		gradA.attr("d", `M${grades[3] / grades[4] * 973 + 10},10 l0,40 Z`);
		gradB.attr("d", `M${grades[2] / grades[4] * 973 + 10},10 l0,40 Z`);
		gradC.attr("d", `M${grades[1] / grades[4] * 973 + 10},10 l0,40 Z`);
	}
	else {
		scoreGaugeRect.attr("width", Math.min(1, (score - grades[4]) / (grades[5] - grades[4])) * 975);
		gaugeFill.attr("fill", "url(#g3)");
		gauge2.show();
		grads.hide();
	}
	scoreNumBase.text(scoreNumShow.html(("" + score).padStart(8, 0).replace(/^0+/, `<span class="leading-zeros">$&</span>`)).text());
}	

function showVoltage(voltage) {
	volGaugeRect.attr("width", voltage * 480);
}

function showEnsembleGauge(ensValue) {
	ensValue = ensValue > 1 ? 1 : ensValue < 0 ? 0 : ensValue;
	ensGaugeRect.attr("width", ensValue * 158);
}

let touches = {};
$("#touch_area").on("touchstart", function(e) {
	if (!playMode) 
		return;
	e.preventDefault();

	for (let touch of e.changedTouches) {
		touches[touch.identifier] = {
			x: touch.clientX,
			y: touch.clientY,
			_refX: touch.clientX,
			_refY: touch.clientY,
			oldLane: -1,
			newLane: (Math.atan2((window.innerHeight / 2 - 40 * ruler) - touch.clientY, touch.clientX - window.innerWidth / 2) * 180 / Math.PI + 90) * (numLanes - 1) / 120,
			flickX: 0,
			flickY: 0,
			phase: 0
		};
	}
});

function signWithThreshold(value, threshold) {
	if (Math.abs(value) < threshold) return 0;
	return Math.sign(value);
}

$("#touch_area").on("touchmove touchend touchcancel", function(e) {
	if (!playMode)
		return;
    e.preventDefault();

	for (let touch of e.changedTouches) {
		let _oldFlickX = touches[touch.identifier].flickX,
		    _oldFlickY = touches[touch.identifier].flickY;
		touches[touch.identifier].oldLane = touches[touch.identifier].newLane;
		touches[touch.identifier].newLane = (Math.atan2((window.innerHeight / 2 - 40 * ruler) - touch.clientY, touch.clientX - window.innerWidth / 2) * 180 / Math.PI + 90) * (numLanes - 1) / 120,
		touches[touch.identifier].flickX = signWithThreshold(touch.clientX - touches[touch.identifier]._refX, 2 * ruler), 
		touches[touch.identifier].flickY = signWithThreshold(touch.clientY - touches[touch.identifier]._refY, 2 * ruler);
		touches[touch.identifier].x = touch.clientX;
		touches[touch.identifier].y = touch.clientY;
		if (_oldFlickX != touches[touch.identifier].flickX && _oldFlickX != 0) touches[touch.identifier]._refX = touches[touch.identifier].x;
		if (_oldFlickY != touches[touch.identifier].flickY && _oldFlickY != 0) touches[touch.identifier]._refY = touches[touch.identifier].y;
		if (touches[touch.identifier].phase == 0 && e.type != "touchmove")
			touches[touch.identifier].phase = 3;
		else
			touches[touch.identifier].phase = 1 + (e.type != "touchmove");
	}
});

let bpmTimings = {}, notes = [], ensembleStart = -1, ensembleNote = -1, ensembleEnd = -1, tracks = {};
let totalCombo = 0, totalCount = 0, totalSkills = 0, totalEnsemble = 0;
let headCursor = -1, tailCursor = -1;
let marks = [];

let score = 0, combo = 0, notePassed = 0, stats = 720000;
let volSP = 0, ensSP = 0, vol = 0.2;
let skills = [];
let asTimeout = null;
let ensemble = -Infinity;
let offset = 0, hiSpeed = 1, numLanes = 0, noteSize = 1;
let stopTime = 0;
let fps = Array(50).fill(0), fpsCursor = 0;
let comboSP1 = 0, comboSP2 = 0, comboSP1Lv = 0, comboSP2Lv = 0, perfectSP = 0;
let hasEnsembleNote = false;

let scrollChangeEnd = 0;
let targetScrollSpeed = 1;
let currentScrollSpeed = 1;
let originalScrollSpeed = 1;
let scrollSpeedMarkers = [];

let tapSE = $(".se-tap"), tapSECursor = 0, tapSELength = tapSE.length;
let segmentSE = $(".se-segment"), segmentSECursor = 0, segmentSELength = segmentSE.length;
let holdSE = $(".se-hold"), holdSECursor = 0, holdSELength = holdSE.length;
let sppSE = $(".se-spp"), sppSECursor = 0, sppSELength = sppSE.length;
let skillSE = $(".se-skill"), skillSECursor = 0, skillSELength = skillSE.length;
let flickSE = $(".se-flick"), flickSECursor = 0, flickSELength = flickSE.length;

function bankerRound(v) {
	let _v = Math.round(v);
	if (v % 2 == 0.5) _v--;
	return _v;
}

let judgmentSPTimeout = null;
function addScore(note, judgment, fs) {
	note.processed = true;
	note.noteElement.remove();
	note.noteElement = null;
	if (note.simul && note.simul.length > 1) {
		for (let i of note.simul) {
			if (i.simulHintElement)
				i.simulHintElement.remove();
			i.simulHintElement = null;
		}
	}
	if (note.holdSegmentElement) {
		note.holdSegmentElement.remove();
		note.holdSegmentElement = null;
	}

	let judgmentSupport = false;
	if (perfectSP > 0 && (judgment == 2 || judgment == 3)) {
		perfectSP--;
		judgment = 4;
		judgmentSupport = true;
	}
	else if (comboSP1 > 0 && (judgment < 2 && judgment >= 1 - (comboSP1Lv > 1))) {
		comboSP1--;
		judgment = 2 + (comboSP1Lv >= 3) + (comboSP1Lv == 5);
		judgmentSupport = true;
	}
	else if (comboSP2 > 0 && (judgment < 2 && judgment >= 1 - (comboSP2Lv > 1))) {
		comboSP2--;
		judgment = 2 + (comboSP2Lv >= 3) + (comboSP2Lv == 5);
		judgmentSupport = true;
	}

	let j = Math.random();
	let c = "", m = 0;
	let judgmentFS = "";

	if (judgment == 4) {
		c = "perfect";
		m = 1;
	}
	else if (judgment == 3) {
		c = "great";
		m = 0.8;
		judgmentFS = fs;
	}
	else if (judgment == 2) {
		c = "good";
		m = 0.5;
		judgmentFS = fs;
	}
	else {
		combo = 0;
		c = judgment == 1 ? "bad" : "miss";
		judgmentFS = judgment == 1 ? fs : "";
		vol -= 0.5 * [1, 0.5, 1, 0][note.type] / (10 + volSP);
	}

	if (judgment > 1) {
		combo++;
		vol += 1.2 * m * [1, 0.5, 1, 5][note.type] / (totalCount - hasEnsembleNote * 9);
		if (note.type == 3)
			startEnsembleSuccess();
		else if (note.addEnsemble)
			ensemble += (13 + ensSP) * m * [1, 0.5, 1][note.type] / 10 / totalEnsemble;
	}
	else if (note.type == 3)
		endEnsembleTime(false);

	if (judgment > 0)
		popTapEffect(note.pos, numLanes, note.type + note.isHoldHead);

	vol = vol > 1 ? 1 : vol < 0 ? 0 : vol;

	let w = c.toUpperCase();
	
	let mult = 1;
	if (combo * 10 > totalCombo * 9) mult = 2;
	else if (combo * 10 > totalCombo * 7) mult = 1.8;
	else if (combo * 10 > totalCombo * 4) mult = 1.6;
	else if (combo * 10 > totalCombo * 2) mult = 1.4;
	else if (combo * 10 > totalCombo) mult = 1.2;

	let t = VideoSource.player.getCurrentTime();
	for (let i of skills) {
		if (!i[2]) {
			if (note.isSkill) {
				i[2] = judgment < 2 ? -t : t;
				scoreUp.addClass("in-effect");
				break;
			}
		}
		else if (i[2] > 0 && t - i[2] < i[0])
			mult += i[1] / 100;
	}
		
	showScore(score += bankerRound(bankerRound(stats * 2 / totalCount) * mult * [1, 0.5, 1, ensemble >= 1 ? 10 : 1][note.type] * m), +chartDiffSelect.val());
	showVoltage(vol);
	showEnsembleGauge(ensemble);

	$("#combo_num").html(combo);
	$("#combo").removeClass("beat")[["show", "hide"][+!combo]]();
	$("#combo").addClass("beat");

	$("#judgment").removeClass("perfect great good bad miss beat2").show();
	$("#judgment").addClass("beat2 " + c).attr("data-judge", w);
	if (judgmentSupport) {
		if (judgmentSPTimeout) clearTimeout(judgmentSPTimeout);
		$("#judgment_sp").show();
		judgmentSPTimeout = setTimeout(function() {
			$("#judgment_sp").hide();
		}, 1000);
	} 
	$("#judgment_fs").attr("data-judge", judgmentFS);
}

function startEnsembleTime() {
	$("#ens_marker").addClass("ensemble-time");
	$("#ens_gauge").show();
	$("#ensemble_sp")[["show", "hide"][+!ensSP]]();
	$(".mark > circle, #line > path").each(function() {
		this.setAttribute(this.getAttribute("stroke") ? "stroke" : "fill", "#ff9");
	})
	ensemble = 0;
}

function startEnsembleSuccess() {
	if (ensemble >= 1)
		$(".ui, #menu_btn").addClass("hide-ui");
	else 
		endEnsembleTime(false);
}

function endEnsembleTime(resetEnsemble) {
	$("#ens_marker").removeClass("ensemble-time");
	$("#ensemble_sp, #ens_gauge").hide();
	$(".ui, #menu_btn").removeClass("hide-ui");
	$(".mark > circle, #line > path").each(function() {
		this.setAttribute(this.getAttribute("stroke") ? "stroke" : "fill", "#fff");
	});
	if (resetEnsemble)
		ensemble = -Infinity;
}

function popNote(note) {
	let noteIndex = -1;
	if (note.type == 3)
		noteIndex = 1;
	else if (note.isSkill)
		noteIndex = 0;
	else if (note.type == 2)
		noteIndex = (5.5 + note.isUDFlick * 2 + note.flickDir / 2) + 7 * 0;
	else if (note.type == 1)
		noteIndex = 4 + 7 * 0;
	else
		noteIndex = (2 + note.isHoldHead) + 7 * 0;

	noteContainer.prepend(note.noteElement = noteTemplates[noteIndex].cloneNode(true));
}

function multiplier(x) {
	return Math.max(0.0001, Math.min(100, 3 ** (x * hiSpeed * currentScrollSpeed / 5)));
}

function mainLoop(t1) {	
	t1 ||= performance.now();
	let nowTime = VideoSource.player.getCurrentTime() + offset;

	let trackTime = {};
	for (let trackID in tracks) {
		let track = tracks[trackID];
		trackTime[trackID] = nowTime;
		for (let j = 0; j < track.length; j++) {
			if (nowTime >= track[j].start) {
				let length = Math.min(nowTime, j < track.length - 1 ? track[j + 1].start : Infinity) - track[j].start;
				trackTime[trackID] += length * (track[j].speed - 1);
			}
		}
	}

	let playTapSE = false, playHoldSE = false, playSegmentSE = false, 
	    playSPPSE = false, playFlickSE = false, playSkillSE = false;
	
	let hasSkill = false;
	for (let skill of skills) {
		if (skill[2] > 0 && nowTime - skill[2] < skill[0])
			hasSkill = true;
	}
	if (!hasSkill)
		scoreUp.removeClass("in-effect");

	if (ensemble < 0 && ensembleStart > 0 && ensembleStart <= nowTime && ensembleEnd > nowTime)
		startEnsembleTime();
	else if (ensemble >= 0 && ensembleEnd > 0 && ensembleEnd <= nowTime)
		endEnsembleTime(true);

	for (let headCursor = 0; headCursor < notes.length; headCursor++) {
		if (notes[headCursor].headScrollTime - 5 / hiSpeed <= trackTime[notes[headCursor].group]
			&& notes[headCursor].follows
			&& !notes[headCursor].holdSegmentElement) {
			let w = document.createElementNS("http://www.w3.org/2000/svg", 'path');
			w.setAttribute("fill", "#fff9");
			w.setAttribute("stroke-width", 2, "#fff");
			holdSegments.prepend(notes[headCursor].holdSegmentElement = w);
		}
	}

	if (playMode) {
		for (let x in touches) {
			let touch = touches[x];
			let hasFlickOrTap = false;
			for (let i = 0; i < notes.length; i++) {
				let note = notes[i];
				if (note.processed)
					continue;

				let timeDiff = nowTime - note.time;
				let isOnLaneNormal = Math.abs(note.pos - touch.newLane) < 0.9, 
					isOnLaneFlick = Math.abs(note.pos - touch.newLane) < 0.6;
				if (touch.phase == 0 || touch.phase == 3) {
					if (isOnLaneNormal) {
						if (note.type == 0 || note.type == 3) {
							if (hasFlickOrTap)
								continue;

							if (timeDiff >= -0.05 && timeDiff <= 0.05) 
								addScore(note, 4);
							else if (timeDiff >= -0.085 && timeDiff <= 0.085) 
								addScore(note, 3, timeDiff > 0 ? "SLOW" : "FAST");
							else if (timeDiff >= -0.12 && timeDiff <= 0.12) 
								addScore(note, 2, timeDiff > 0 ? "SLOW" : "FAST");
							else if (timeDiff >= -0.17 && timeDiff <= 0.17)
								addScore(note, 1, timeDiff > 0 ? "SLOW" : "FAST");
						}
						hasFlickOrTap = true;
					}
				}
				else {
					if (note.type == 2 && isOnLaneFlick && note.flickDir == (note.isUDFlick ? touch.flickY : touch.flickX)) {
						if (hasFlickOrTap)
							continue;

						if (note.follows == null && timeDiff < -0.1) {
							if (timeDiff >= -0.17)
								addScore(note, 3, "FAST");
							else if (timeDiff >= -0.24)
								addScore(note, 2, "FAST");
							else if (timeDiff >= -0.34)
								addScore(note, 1, "FAST");
						}
						
						if (timeDiff >= 0.155)
							addScore(note, 1, "SLOW");
						else if (timeDiff >= 0.11)
							addScore(note, 2, "SLOw");
						else if (timeDiff >= 0.075)
							addScore(note, 3, "SLOW");
						else if (timeDiff >= -0.1)
							addScore(note, 4);
					}
					else if (note.type == 1 && isOnLaneNormal) {
						if (touch.phase == 2) {
							if (timeDiff >= -0.05 && timeDiff <= 0.05)
								addScore(note, 4);
							else if (timeDiff >= -0.085 && timeDiff <= 0.085)
								addScore(note, 3, timeDiff > 0 ? "SLOW" : "FAST");
							else if (timeDiff >= -0.12 && timeDiff <= 0.12)
								addScore(note, 2, timeDiff > 0 ? "SLOW" : "FAST");
						}
						else if (touch.phase == 1) {
							if (timeDiff >= 0.12)
								addScore(note, 1, "SLOW");
							else if (timeDiff >= 0.085)
								addScore(note, 2, "SLOW");
							else if (timeDiff >= 0.05)
								addScore(note, 3, "SLOW");
							else if (timeDiff >= 0)
								addScore(note, 4);
						}
					}
				}
			}
		}
		for (let i of Object.keys(touches)) {
			if (touches[i].phase >= 2)
				delete touches[i];
			else if (touches[i].phase == 0)
				touches[i].phase = 1;
		}
	}

	for (let i = notes.length - 1; i >= 0; i--) {
		let note = notes[i];
		
		if (!note.processed) {
			let tempSimul = note.simul ? note.simul.filter(x => !x.processed).map(x => x.pos) : [];
			let m = multiplier(trackTime[note.group] - note.scrollTime);
			let angle = (270 + 120 * note.pos / (numLanes - 1)) * Math.PI / 180;
			let radius = 9.5 + 70.5 * (m - 1/3) * 1.5,
				radius2 = radius * 10,
				angle1 = (270 + 120 * Math.max(...tempSimul) / (numLanes - 1)) * Math.PI / 180,
				angle2 = (270 + 120 * Math.min(...tempSimul) / (numLanes - 1)) * Math.PI / 180;

			if (note.scrollTime - 5 / hiSpeed <= trackTime[note.group]) {				
				if (!note.noteElement) {
					popNote(note);
					if (tempSimul.length > 1 && !note.simulHintElement) {
						let w = document.createElementNS("http://www.w3.org/2000/svg", 'path');
						w.setAttribute("stroke", "#fff");
						w.setAttribute("stroke-width", "8");
						w.setAttribute("fill", "#fff0");
						note.simulHintElement = w;
						simulHints.prepend(w);
					}
				}
				note.noteElement.style.setProperty("--multiplier", m);
				note.noteElement.style.top = `calc(50% - ${40 + radius * Math.sin(angle)} * var(--ruler))`;
				note.noteElement.style.left = `calc(50% + ${radius * Math.cos(angle)} * var(--ruler))`;
			}
		    else if (note.noteElement) {
				note.noteElement.remove();
				if (note.simulHintElement)
					note.simulHintElement.remove();
				if (note.holdSegmentElement)
					note.holdSegmentElement.remove();
				note.noteElement = null;
				note.simulHintElement = null;
				note.holdSegmentElement = null;
			}
			
			if (note.simulHintElement) {
				note.simulHintElement.setAttribute(
					"d", 
					`M${1250 + radius2 * Math.cos(angle1)},${1250 - radius2 * Math.sin(angle1)} A${radius2},${radius2},0,0,1,${1250 + radius2 * Math.cos(angle2)},${1250 - radius2 * Math.sin(angle2)}`
				);
			}
			
			if (note.follows && note.holdSegmentElement) {
				let command1 = "", command2 = "", l = note.followPath.length;
				let params = note.followPath.map(function([t, p]) {
					let m = multiplier(trackTime[note.group] - t),
						d = 95 + 705 * (m - 1/3) * 1.5,
						r = 56 * noteSize * m,
						a = (270 + 120 * p / (numLanes - 1)) * Math.PI / 180,
						x = 1250 + d * Math.cos(a),
						y = 1250 - d * Math.sin(a);
					return {t, p, m, d, r, a, x, y};
				});
				let movingAngles = params.slice(0, -1).map((n, i) => Math.atan2(n.y - params[i + 1].y, params[i + 1].x - n.x));
				for (let i = 0; i < l - 1; i++) {
					let dx = params[i].r * Math.cos(movingAngles[i] + Math.PI / 2),
						dy = params[i].r * -Math.sin(movingAngles[i] + Math.PI / 2),
						dx2 = params[i + 1].r * Math.cos(movingAngles[i] + Math.PI / 2),
						dy2 = params[i + 1].r * -Math.sin(movingAngles[i] + Math.PI / 2);
					if (i == 0) {
						command1 = `M${params[i].x + dx},${params[i].y + dy}`;
						command2 = `L${params[i].x - dx},${params[i].y - dy} A${params[i].r},${params[i].r},0,0,1,${params[i].x + dx},${params[i].y + dy} Z`;
					}
					if (i != l - 2 && movingAngles[i] != movingAngles[i + 1]) {
						let dir = movingAngles[i + 1] - movingAngles[i];
						while (dir < 0)
							dir += Math.PI * 2;
						if (dir < Math.PI) {		// Left turn
							let newRadius = params[i + 1].r / Math.cos(dir / 2);
							command1 += ` L${params[i + 1].x + newRadius * Math.cos(movingAngles[i] + (Math.PI + dir) / 2)},${params[i + 1].y - newRadius * Math.sin(movingAngles[i] + (Math.PI + dir) / 2)}`;
							command2 = `L${params[i + 1].x + params[i + 1].r * Math.cos(movingAngles[i + 1] - Math.PI / 2)},${params[i + 1].y - params[i + 1].r * Math.sin(movingAngles[i + 1] - Math.PI / 2)} A${params[i + 1].r},${params[i + 1].r},0,0,1,${params[i + 1].x - dx2},${params[i + 1].y - dy2} ` + command2;
						}
						else {					// Right turn
							dir = Math.PI * 2 - dir;
							let newRadius = params[i + 1].r / Math.cos(dir / 2);
							command1 += ` L${params[i + 1].x + dx2},${params[i + 1].y + dy2} A${params[i + 1].r},${params[i + 1].r},0,0,1,${params[i + 1].x + params[i + 1].r * Math.cos(movingAngles[i + 1] + Math.PI / 2)},${params[i + 1].y - params[i + 1].r * Math.sin(movingAngles[i + 1] + Math.PI / 2)}`;
							command2 = `L${params[i + 1].x + newRadius * Math.cos(movingAngles[i] - (Math.PI + dir) / 2)},${params[i + 1].y - newRadius * Math.sin(movingAngles[i] - (Math.PI + dir) / 2)} ` + command2;						
						}
					}
					else {
						command1 += ` L${params[i + 1].x + dx2},${params[i + 1].y + dy2}`;
						command2 = `L${params[i + 1].x - dx2},${params[i + 1].y - dy2} ` + command2;
						if (i == l - 2)
							command1 += ` A${params[i + 1].r},${params[i + 1].r},0,0,1,${params[i + 1].x - dx2},${params[i + 1].y - dy2} `;
					}
				}
				note.holdSegmentElement.setAttribute("d", command1 + command2);
				
			}
			if (!playMode && note.headTime <= nowTime && note.time > nowTime)
				playHoldSE = true;
			if (!playMode && note.time <= nowTime) {
				addScore(note, 4);
				if (note.type == 3)
					playSPPSE = true;
				else if (note.type == 2)
					playFlickSE = true;
				else if (note.type == 1)
					playSegmentSE = true;
				else if (note.type == 0) {
					if (note.isSkill)
						playSkillSE = true;
					else
						playTapSE = true;
				}
			}
			else if (note.time + 0.17 <= nowTime) 
				addScore(note, 0, "SLOW");
		}
	}
//	while (tailCursor < headCursor && notes[tailCursor + 1].processed)
//		tailCursor++;

	if (playTapSE) {
		let p = tapSE[tapSECursor = (tapSECursor + 1) % tapSELength];
		p.currentTime = 0;
		p.play();
	}
	if (playFlickSE) {
		let p = flickSE[flickSECursor = (flickSECursor + 1) % flickSELength];
		p.currentTime = 0;
		p.play();
	}
	if (playSkillSE) {
		let p = skillSE[skillSECursor = (skillSECursor + 1) % skillSELength];
		p.currentTime = 0;
		p.play();
	}
	if (playSegmentSE) {
		let p = segmentSE[segmentSECursor = (segmentSECursor + 1) % segmentSELength];
		p.currentTime = 0;
		p.play();
	}
	if (playSPPSE) {
		let p = sppSE[sppSECursor = (sppSECursor + 1) % sppSELength];
		p.currentTime = 0;
		p.play();
	}
	if (playHoldSE) {
		let p = holdSE[holdSECursor = (holdSECursor + 1) % holdSELength];
		if (p.paused || p.ended) {
			p.currentTime = 0;
			p.play();
		}
	}
	else 
		holdSE.each(function() {this.pause();});

    let renderTime = performance.now() - t1;
    if (stopTime > nowTime - offset) {
        //asTimeout = requestAnimationFrame(mainLoop);
        asTimeout = setTimeout(mainLoop, renderTime < 940 / 60 ? 1000 / 60 - renderTime : 1);

        if (fps[0]) 
            fpsShow.text((60000 / (t1 - fps[fpsCursor])).toFixed(2) + ` FPS (Rendering time = ${renderTime.toFixed(1)} ms); #Touches = ${Object.keys(touches).length}; Voltage = ${(vol * 100).toFixed(2)}; Ensemble = ${(ensemble * 100).toFixed(2)}`).show();
        fps[fpsCursor] = t1;
		fpsCursor = (fpsCursor + 1) % 50;
    }
    else {
        stopLoop(false);
        return;
    }

}

function stopLoop(manual) {
	clearTimeout(asTimeout);
	if (VideoSource)
		VideoSource.player.stopVideo();
	holdSE.each(function() {this.pause();});
	fpsShow.hide();

	if (!manual) {

	}
}

function readChart() {
	noteContainer.empty();
	simulHints.empty();
	holdSegments.empty();
	touches = {};
	flickDir = {};

	let file = $("#chart").val().replace(levelRegex, "").replace(videoRegex, "").replace(stopRegex, (_, a) => (stopTime = +a) || "");
	bpmTimings = {};
	tracks = {"0": []};
	notes = [];
	ensembleStart = -1;
	ensembleNote = -1;
	ensembleEnd = -1;
	totalCombo = 0;
	totalCount = 0;
	totalSkills = 0;
	totalEnsemble = 0;
	hasEnsembleNote = false;
	let section = 1, bar = 0, beat = 0, time = 0, follow = [];

	let tracking = 0;

	checkRegex.exec("");
	levelRegex.exec("");
	videoRegex.exec("");
	stopRegex.exec("");

	let match = null;
	while (match = checkRegex.exec(file)) {
		if (match[1]) {
			if (+match[7] == 0)
				throw `BPM cannot be 0 in command ${match[0]}`;
			bpmTimings[match[2]] = {
				start: +match[3],
				crots: +match[5],
				bpm: +match[7]
			};
		}
		else if (match[31]) {
			if (!tracks[tracking = +match[31]])
				tracks[tracking] = [];
		}
		else {
			let isFollow = match[10] == "=";

			if (match[11]) {
				if (match[23])
					time = +match[23];
				else {
					section = +(match[14] || section);
					bar = +(match[15] || bar);
					beat = +(match[16] || beat);
					let subBeat = match[17] ? match[18] ? match[18] / match[20] : +match[22] || 0 : 0;
					
					if (!bpmTimings[section])
						throw `The section is not yet defined in command ${match[0]}`;
					time = bpmTimings[section].start + (bar * bpmTimings[section].crots + beat + subBeat) * 60 / bpmTimings[section].bpm;
				}
			}

			if (match[25][0] == "?") {
				if (ensembleStart > -1)
					throw `The ensemble time has started already in command ${match[0]}`;
				ensembleStart = time;
			}
			else if (match[25][0] == "~") {
				if (ensembleEnd > -1)
					throw `The ensemble time has ended in command ${match[0]}`;
				ensembleEnd = time;
			}
			else if (match[10] == ">")
				tracks[tracking].push({start: time, speed: +match[27]});
			else {
				let group = +match[30] || 0;
				let note = {
					time, 
					headTime: time,
					type: match[25][0] == "!" ? 3 : match[26] ? "OSLRUD".indexOf(match[26]) > 1 ? 2 : +isFollow : -1,
					pos: match[25][0] == "!" ? 0 : +match[27],
					isSkill: match[26] == "S",
					isHoldHead: false,
					flickDir: "LU".indexOf(match[26]) >= 0 ? -1 : "DR".indexOf(match[26]) >= 0 ? 1 : 0,
					isUDFlick: +("UD".indexOf(match[26]) >= 0),
					follows: null,
					followPath: [],
					group,
					addEnsemble: false,
					processed: false,
					simul: null,
					simulHint: null                
				};
				if (!tracks[group]) tracks[group] = [];
				if (match[25][0] == "!") hasEnsembleNote = true;

				if (isFollow) {
					note.follows = notes[totalCombo - 1];

					let followEnd = follow[follow.length - 1];
					
					if (followEnd[1] == note.pos)
						follow.push([note.time, note.pos]);
					else {
						let count = Math.abs(note.pos - followEnd[1]) * 4;
						for (let i = 1, p = followEnd[1]; i <= count; i++)
							follow.push([followEnd[0] + (note.time - followEnd[0]) * i / count, p += note.pos < followEnd[1] ? -0.25 : 0.25]);
					}
					
					note.followPath = follow;
					note.headTime = follow[0][0];
					if (!note.follows)
						throw `The first note cannot follow any note in command ${match[0]}`;
					else if (note.type == 3 || note.isSkill) 
						throw `A skill note or an Ensemble Note cannot follow any note in command ${match[0]}`;
					else if (note.follows.type > 2)
						throw `A note cannot follow an Ensemble Note in command ${match[0]}`;
					else if (note.follows.time >= note.time)
						throw `A note cannot follow a note from behind in command ${match[0]}`;
					else if (note.type >= 1) {
						notes.push(note);
						if (note.follows.type == 0)
							note.follows.isHoldHead = true;
						totalCombo++;
						totalCount += note.type / 2;
					}
				}
				else {
					if (note.type == -1)
						throw `A turn in the slide path must follow a note, a knot or a turn in command ${match[0]}`;
					notes.push(note);
					totalCombo++;
					totalCount += note.type == 3 ? 10 : 1;
					totalSkills += note.isSkill;
					if (totalSkills > 5)
						throw `Only 5 skill notes can exist in command ${match[0]}`;
					if (note.type == 3) {
						if (ensembleNote > -1)
							throw `Only one Ensemble note can exist in command ${match[0]}`;
						ensembleNote = time;
					}
				}

				if (note.type >= 0)
					follow = [[note.time, note.pos]];
			}
		}
	}

	if (notes.length == 0)
		throw "Empty chart";
	if (ensembleStart > ensembleNote || ensembleNote > ensembleEnd)
		throw "Malformed Ensemble time";

	notes.forEach(function(note) {
		note.scrollTime = note.time;
		note.headScrollTime = note.headTime;
		let track = tracks[note.group];
		for (let j = 0; j < track.length; j++) {
			if (note.time >= track[j].start) {
				let length = Math.min(note.time, j < track.length - 1 ? track[j + 1].start : Infinity) - track[j].start;
				note.scrollTime += length * (track[j].speed - 1);
			}
			if (note.headTime >= track[j].start) {
				let length = Math.min(note.headTime, j < track.length - 1 ? track[j + 1].start : Infinity) - track[j].start;
				note.headScrollTime += length * (track[j].speed - 1);
			}
		}
		
		for (let k = 0; k < note.followPath.length; k++) {
			let fTime = note.followPath[k][0];
			for (let j = 0; j < track.length; j++) {
				if (note.followPath[k][0] >= track[j].start) {
					let length = Math.min(note.followPath[k][0], j < track.length - 1 ? track[j + 1].start : Infinity) - track[j].start;
					fTime += length * (track[j].speed - 1);
				}
			}
			note.followPath[k][0] = fTime;
		}
	});

	console.log('tracks', tracks, '; notes', notes);

	notes.sort((a, b) => a.time - b.time || a.group - b.group).map(function (_, i) {
		if (i > 0 && notes[i].time == notes[i - 1].time && notes[i].type != 1 && notes[i - 1].type != 1) {
			if (!notes[i - 1].simul)
				notes[i - 1].simul = [notes[i - 1], notes[i]];
			else 
				notes[i - 1].simul.push(notes[i]);
			notes[i].simul = notes[i - 1].simul;
		}
	});
	notes.sort((a, b) => a.headScrollTime - b.headScrollTime);
	for (let note of notes) {
		if (note.time >= ensembleNote && note.time < ensembleEnd && note.type != 3)
			throw "No note can appear during the Ensemble appeal";
		else if (note.time >= ensembleStart && note.time < ensembleNote) {
			note.addEnsemble = true;
			totalEnsemble += [1, 0.5, 1, 0][note.type];
		}
	}
}

$("#close_menu").on("click", function() {
	try {
		showScore(score = 0, +chartDiffSelect.val());
		showVoltage(vol = 0.2);
		showEnsembleGauge(ensemble = -Infinity);
		combo = 0;
		notePassed = 0;
		skills = [];
		headCursor = -1;
		tailCursor = -1;
		for (let i = 0; i < 5; i++)
			skills.push([+$(`#lsk${i}_length`).val(), +$(`#lsk${i}_effect`).val(), 0]);
		readChart();
		fps.fill(0);
		fpsCursor = 0;

		// Still not sure the effects, only know that 1*V3 = -50% / 11 per miss & 2*V3 = -50% / 12 per miss
		volSP = (~~$("#ssk0").val().split`V`[1] + ~~$("#ssk1").val().split`V`[1]) / 3;
		ensSP = (~~$("#ssk0").val().split`E`[1] + ~~$("#ssk1").val().split`E`[1]) / 3;
		perfectSP = ~~$("#ssk0").val().split`P`[1] + ~~$("#ssk1").val().split`P`[1];
		comboSP1Lv = ~~$("#ssk0").val().split`C`[1];
		comboSP2Lv = ~~$("#ssk1").val().split`C`[1];
		comboSP1 = (comboSP1Lv >= 1) + (comboSP1Lv >= 4);
		comboSP2 = (comboSP2Lv >= 1) + (comboSP2Lv >= 4);

		$("#voltage_sp")[["show", "hide"][+!volSP]]();
		$("#ensemble_sp").hide();
		$("#judgment_sp").hide();
		$("#menu").hide();
		if (VideoSource) {
			VideoSource.player.seekTo(0);
			VideoSource.player.playVideo();
		}
	}
	catch (e) {
		alert(Globals.getTranslation("CHART_ERROR", document.documentElement.lang) + e);
	}
})

$("#menu_btn").on("click", function() {
	$("#menu").show();
	stopLoop(true);
	$("#combo").hide();
	scoreUp.removeClass("in-effect");
	endEnsembleTime(true);
}).trigger("click");

$("#setting_yt").on("submit", function(e) {
	e.preventDefault();
	e.stopPropagation();
	if (e.target.checkValidity()) {
		VideoSource = YouTubeVideoSource;
		VideoSource.loadSource($("#yt_videoid").val());
		
		$(".external-source").hide();
		$("#yt").show();
	}
	return false;
});

$("#setting_local_video").on("submit", function(e) {
	e.preventDefault();
	e.stopPropagation();
	if (e.target.checkValidity()) {
		VideoSource = LocalVideoSource;
		VideoSource.loadSource(URL.createObjectURL($("#local_video_path")[0].files[0]));
		
		$(".external-source").hide();
		$("#local_video").show();
	}
	return false;
});

$("#setting_local_audio").on("submit", function(e) {
	e.preventDefault();
	e.stopPropagation();
	if (e.target.checkValidity()) {
		VideoSource = LocalAudioSource;
		VideoSource.loadSource(URL.createObjectURL($("#local_audio_path")[0].files[0]));
		
		$(".external-source").hide();
		$("#local_audio").show();
	}
	return false;
});

$("#brightness").on("input", function() {
	$("#brightness_mask").css({"opacity": 0.5 - this.value / 200});
});

$("#note_size").on("input", function() {
	document.documentElement.style.setProperty("--note-size", noteSize = this.value / 100);
});

$("#volume").on("input", function() {
	if (VideoSource)
		VideoSource.player.setVolume(this.value);
});

$("#total_str").on("input", function() {
	stats = +this.value;
});

$("#offset").on("input", function() {
	offset = +this.value;
});

$("#hi_speed").on("input", function() {
	hiSpeed = +this.value;
});

$("#chart_lvl").on("input", function(e) {
	if (+e.target.value < 26)
		e.target.value = Math.floor(e.target.value);
});

$("input[type=range]").on("input", function(e) {
	let a = $(`.range-value[data-value=${e.target.id}]`)[0];
	let separator = a.dataset.separator || "";
	let value = a.dataset.fixed 
				? (+e.target.value).toFixed(a.dataset.fixed).replace(/\d+?(?=(\d{3})+[^\d])/g, `$&${separator}`)
				: e.target.value.replace(/(\d)(\d{2})(?=\d(\d{3})*(\.|$))/g, `$1${separator}$2`);
	a.innerHTML = a.dataset.format.replace(/_([+]?)/, function(_, formatCode) {
		if (formatCode == "+")
			if (value % 1) return Math.floor(value) + "+";
		return value;
	});
});

$("#fs").on("click", function() {
	if (!document.fullscreenEnabled && !document.webkitFullscreenEnabled)
		return;
	if (document.fullscreenElement || document.mozFullScreenElement 
		|| document.webkitFullscreenElement || document.msFullscreenElement)
		(document.exitFullscreen || document.webkitExitFullscreen).call(document);
	else
		(document.body.requestFullscreen || document.body.webkitRequestFullscreen).call(document.body);
});


chartDiffSelect.on("change", function() {
	loadJudgmentLine(numLanes = this.value < 2 ? 7 : 9);
});

let enableFS = false;
$("#fast_slow").on("change", function() {
	enableFS = this.value == "1";
});


let playMode = true;
$("#playmode").on("click", function() {
	playMode = !playMode;
	let s = playMode ? "ENABLED" : "DISABLED";
	this.dataset.translate = s;
	this.innerHTML = Globals.getTranslation(s, document.documentElement.lang);
}).trigger("click");

let lang = "zh-Hant";
let searchLang = /[?&]lang=(zh-Han[st]|en|ja)/.exec(location.href);
if (searchLang)
	lang = searchLang[1];
$("#lang").on("change", function() {	
	Globals.setTranslation(document.documentElement.lang = this.value);
	let href = location.href.replace(/([?&]lang)=(zh-Han[st]|en|ja)/, `$1=${this.value}`);
	if (!/([?&]lang)=(zh-Han[st]|en|ja)/.test(location.href))
		href += `${href.indexOf("?") == -1 ? "?" : "&"}lang=${this.value}`;
	window.history.replaceState("", document.title, href);
	document.title = Globals.getTranslation("TITLE", document.documentElement.lang);
}).val(lang);
$("#combo_pos").on("change", function() {
	$("#combo").removeClass("top-center bottom-center top-right none").addClass(this.value);
});
$("#judge_pos").on("change", function() {
	$("#judgment").removeClass("top center bottom none").addClass(this.value);
});

$("#chart").on("change", function() {
	let file = this.value;

	let levelDefinition = levelRegex.exec(file);
	if (levelDefinition) {
		chartDiffSelect.val(levelDefinition[2] ? 0 : levelDefinition[3] ? 1 : levelDefinition[4] ? 2 : levelDefinition[5] ? 3 : 4).trigger("change");
		var lvl = +levelDefinition[7];
		if (lvl >= 26 && levelDefinition[8]) lvl += 0.5;
		$("#chart_lvl").val(lvl).trigger("input");
	}

	let videoDefinition = videoRegex.exec(file);
	if (videoDefinition) {
		if (VideoSource === YouTubeVideoSource) {
			$("#yt_videoid").val(videoDefinition[1]).trigger("change");
			if (VideoSource) 
				$("#setting_" + $("#setting_src_type").val()).trigger("submit");
		}
	}
});

$("#setting_src_type").on("change", function() {
	$(".setting-src-types").hide();
	$("#setting_" + this.value).show();
});

$("*[data-storable]").each(function() {
	if (window.localStorage.getItem(this.id))
		this.value = window.localStorage.getItem(this.id);
}).trigger("input").trigger("change").on("change", function() {
	window.localStorage.setItem(this.id, this.value);
});

window.onresize();
