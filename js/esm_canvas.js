const checkRegex = /((\d+)#(\d+(\.\d+)?):(\d+(\.\d+)?):(\d+(\.\d+)?))|((=)?((((\d+)?:(\d+))?_(\d+))?(\+(\d+(\.\d+)?)\/(\d+(\.\d+)?)|(\.\d+))?|(\d+(\.\d+)?))?([!?~]|@([OSLR])?(-?[01234](\.\d+)?)))/gi;
const levelRegex = /((EASY)|(NORMAL)|(HARD)|(EXPERT))_LEVEL_(30|[12][0-9]|0?[1-9])/i;
const videoRegex = /v=([A-Za-z0-9-_]{11})/;
const stopRegex = /stop=(\d+(\.\d+)?)/;
const twoPI = 2 * Math.PI, _130deg = 130 / 180 * Math.PI, _50deg = 50 / 180 * Math.PI, quarter = Math.PI / 2;

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
    ctx = $("#note_container")[0].getContext("2d");

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

// 200 in svg = 280 * multiplier

function drawSkillNote([x, y], m) {
    /*
            <svg class="note" id="note_skill" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="50" fill="#39c" />
                <circle cx="100" cy="100" r="40" stroke="#fff" stroke-width="8" fill="#fff0" />
                <path d="M100,80 L106,92 L119,94 L110,103 L112,116 L100,110 L88,116 L90,103 L81,94 L94,92 Z" fill="#fff" />
            </svg>
    */
    ctx.fillStyle = "#39c";
    ctx.beginPath();
    ctx.arc(x, y, 70 * m, 0, twoPI);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 11.2 * m;
    ctx.beginPath();
    ctx.arc(x, y, 56 * m, 0, twoPI);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(x, -28 * m + y);
    ctx.lineTo(  8.22899 * m + x, -11.32624 * m + y);
    ctx.lineTo( 26.62958 * m + x,  -8.65248 * m + y);
    ctx.lineTo( 13.31479 * m + x,   4.32625 * m + y);
    ctx.lineTo( 16.45799 * m + x,  22.65248 * m + y);
    ctx.lineTo(x, 14 * m + y);
    ctx.lineTo(-16.45799 * m + x,  22.65248 * m + y);
    ctx.lineTo(-13.31479 * m + x,   4.32625 * m + y);
    ctx.lineTo(-26.62958 * m + x,  -8.65248 * m + y);
    ctx.lineTo( -8.22899 * m + x, -11.32624 * m + y);
    ctx.fill();
}

function drawEnsembleNote([x, y], m) {
    let gradient = ctx.createRadialGradient(x, y, 0, x, y, 105 * m);
    gradient.addColorStop(  0, "#f99");
    gradient.addColorStop(1/6, "#ff9");
    gradient.addColorStop(2/6, "#9f9");
    gradient.addColorStop(3/6, "#9ff");
    gradient.addColorStop(4/6, "#99f");
    gradient.addColorStop(5/6, "#f9f");
    gradient.addColorStop(  1, "#f99");

    ctx.fillStyle = gradient;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 6 * m;
    ctx.beginPath();
    ctx.arc(x, y, 105 * m, 0, twoPI);
    ctx.fill();
    ctx.stroke();
}

function drawTapNote1([x, y], m) {
    /*
            <svg class="note" id="note_tap_1" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="50" fill="#03c" />
                <circle cx="100" cy="100" r="40" stroke="#fff" stroke-width="8" fill="#fff0" />
                <circle cx="100" cy="100" r="10" fill="#fff" />
            </svg>
    */
    ctx.fillStyle = "#03c";
    ctx.beginPath();
    ctx.arc(x, y, 70 * m, 0, twoPI);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 11.2 * m;
    ctx.beginPath();
    ctx.arc(x, y, 56 * m, 0, twoPI);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x, y, 14 * m, 0, twoPI);
    ctx.fill();
}

function drawHoldHead1([x, y], m) {
    /*
            <svg class="note" id="note_hold_1" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="50" fill="#f90" />
                <circle cx="100" cy="100" r="40" stroke="#fff" stroke-width="8" fill="#fff0" />
                <circle cx="100" cy="100" r="10" fill="#fff" />
            </svg>
    */
    ctx.fillStyle = "#f90";
    ctx.beginPath();
    ctx.arc(x, y, 70 * m, 0, twoPI);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 11.2 * m;
    ctx.beginPath();
    ctx.arc(x, y, 56 * m, 0, twoPI);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x, y, 14 * m, 0, twoPI);
    ctx.fill();
}

function drawFlickLeft1([x, y], m) {
    /*
            <svg class="note" id="note_flick_left_1" viewBox="0 0 200 200">
                <path d="M68,62 A50,50,0,1,1,68,138 L25,102 A3,3,0,0,1,25,98 Z" fill="#f03" />
                <path d="M74,69 A40,40,0,1,1,74,131 L40,102 A3,3,0,0,1,40,98 Z" stroke="#fff" stroke-width="8" fill="#fff0" />
                <path d="M54,100 L84,75 L84,90 L119,90 A10,10,0,0,1,119,110 L84,110 L84,125 Z" fill="#fff" />
            </svg>    
    */
    ctx.fillStyle = "#f03";
    ctx.beginPath();
    ctx.moveTo(x -  44.99513 * m, y - 53.62311 * m);
    ctx.arc(x, y, 70 * m, -_130deg, _130deg);
    ctx.lineTo(x - 105.06634 * m, y +  3.21739 * m);
    ctx.arc(x - 102.36663 * m, y, 4.2 * m, _130deg, -_130deg);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 11.2 * m;
    ctx.beginPath();
    ctx.moveTo(x - 35.99610 * m, y - 42.89849 * m);
    ctx.arc(x, y, 56 * m, -_130deg, _130deg);
    ctx.lineTo(x - 84.05307 * m, y +  2.57391 * m);
    ctx.arc(x - 81.89330 * m, y, 3.36 * m, _130deg, -_130deg);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(x - 64.4 * m, y);
    ctx.lineTo(x - 22.4 * m, y - 35 * m);
    ctx.lineTo(x - 22.4 * m, y - 14 * m);
    ctx.lineTo(x + 26.6 * m, y - 14 * m);
    ctx.arc(x + 26.6 * m, y, 14 * m, -quarter, quarter);
    ctx.lineTo(x - 22.4 * m, y + 14 * m);
    ctx.lineTo(x - 22.4 * m, y + 35 * m);
    ctx.closePath();
    ctx.fill();
}

function drawFlickRight1([x, y], m) {
    /*    
            <svg class="note" id="note_flick_right_1" viewBox="0 0 200 200">
                <path d="M132,138 A50,50,0,1,1,132,62 L175,98 A3,3,0,0,1,175,102 Z" fill="#f60" />
                <path d="M126,131 A40,40,0,1,1,126,69 L160,98 A3,3,0,0,1,160,102 Z" stroke="#fff" stroke-width="8" fill="#fff0" />
                <path d="M146,100 L116,125 L116,110 L81,110 A10,10,0,0,1,81,90 L116,90 L116,75 Z" fill="#fff" />
            </svg>
    */
    ctx.fillStyle = "#f60";
    ctx.beginPath();
    ctx.moveTo(x +  44.99513 * m, y + 53.62311 * m);
    ctx.arc(x, y, 70 * m, _50deg, -_50deg);
    ctx.lineTo(x + 105.06634 * m, y -  3.21739 * m);
    ctx.arc(x + 102.36663 * m, y, 4.2 * m, -_50deg, _50deg);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 11.2 * m;
    ctx.beginPath();
    ctx.moveTo(x + 35.99610 * m, y + 42.89849 * m);
    ctx.arc(x, y, 56 * m, _50deg, -_50deg);
    ctx.lineTo(x + 84.05307 * m, y -  2.57391 * m);
    ctx.arc(x + 81.89330 * m, y, 3.36 * m, -_50deg, _50deg);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(x + 64.4 * m, y);
    ctx.lineTo(x + 22.4 * m, y + 35 * m);
    ctx.lineTo(x + 22.4 * m, y + 14 * m);
    ctx.lineTo(x - 26.6 * m, y + 14 * m);
    ctx.arc(x - 26.6 * m, y, 14 * m, quarter, -quarter);
    ctx.lineTo(x + 22.4 * m, y - 14 * m);
    ctx.lineTo(x + 22.4 * m, y - 35 * m);
    ctx.closePath();
    ctx.fill();
}

function drawHoldKnot1([x, y], m) {
    /*
            <svg class="note" id="note_knot_1" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="36" stroke="#fff" stroke-width="8" fill="#fff9" />
                <path d="M64,92 L80,100 L64,108 Z" fill="#fff" />
                <path d="M136,92 L120,100 L136,108 Z" fill="#fff" />
            </svg>
    */
    ctx.fillStyle = "#fff9";
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 11.2 * m;
    ctx.beginPath();
    ctx.arc(x, y, 50.4 * m, 0, twoPI);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(x - 50.4 * m, y - 11.2 * m);
    ctx.lineTo(x - 28 * m, y);
    ctx.lineTo(x - 50.4 * m, y + 11.2 * m);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 50.4 * m, y - 11.2 * m);
    ctx.lineTo(x + 28 * m, y);
    ctx.lineTo(x + 50.4 * m, y + 11.2 * m);
    ctx.fill();
}

function drawSimulHint(angle1, angle2, m) {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 8 * m;
    ctx.beginPath();
    ctx.arc(
        1250, 
        1250, 
        95 + 705 * (m - 1/3) * 1.5, 
        (0.5 - angle1 * 2/3 / (numLanes - 1)) * Math.PI,
        (0.5 - angle2 * 2/3 / (numLanes - 1)) * Math.PI
    );
    ctx.stroke();
}

const gradA = $("#grad_a"), gradB = $("#grad_b"), gradC = $("#grad_c"),
       gaugeA = $(".gauge-a"), gaugeB = $(".gauge-b"), gaugeC = $(".gauge-c"), gaugeS = $(".gauge-s"), gauge2 = $(".gauge-s2, .gauge-sp"),
      grads = $(".grads"), gaugeFill = $("#gauge_fill"), scoreGaugeRect = $("rect", "#gauge2"),
      scoreNum = $("#score_num"), scoreNumBase = $(".base", scoreNum), scoreNumShow = $(".show", scoreNum), scoreUp = $("#score_up"),
      volGaugeRect = $("rect", "#gauge"),
      ensGaugeRect = $("#ens_fill"),
      chartDiffSelect = $("#chart_diff"),
      fpsShow = $("#fps");

function showScore(score, difficulty) {
    let grades = [
        [0, 60000, 200000, 360000, 600000, 1800000],
        [0, 60000, 200000, 360000, 600000, 1800000],
        [0, 66000, 220000, 396000, 660000, 1960000],
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
$("#board").on("touchstart", function(e) {
    if (!playMode)
        return;

    for (let touch of e.changedTouches) {
        touches[touch.identifier] = {
            x: touch.clientX,
            oldLane: -1,
            newLane: (Math.atan2((window.innerHeight / 2 - 40 * ruler) - touch.clientY, touch.clientX - window.innerWidth / 2) * 180 / Math.PI + 90) * (numLanes - 1) / 120,
            flick: 0,
            phase: 0
        };
    }
});

$("#board").on("touchmove touchend touchcancel", function(e) {
    if (!playMode)
        return;

    for (let touch of e.changedTouches) {
        touches[touch.identifier].oldLane = touches[touch.identifier].newLane;
        touches[touch.identifier].newLane = (Math.atan2((window.innerHeight / 2 - 40 * ruler) - touch.clientY, touch.clientX - window.innerWidth / 2) * 180 / Math.PI + 90) * (numLanes - 1) / 120,
        touches[touch.identifier].flick = Math.sign(touch.clientX - touches[touch.identifier].x);
        touches[touch.identifier].x = touch.clientX;
        touches[touch.identifier].phase = 1 + (e.type != "touchmove");
    }
});

let bpmTimings = {}, notes = [], ensembleStart = -1, ensembleNote = -1, ensembleEnd = -1;
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

function addScore(note, judgment) {
    note.processed = true;
    if (note.simul)
        note.simul.simul = note.simul = null;

    let j = Math.random();
    let c = "", m = 0;
    if (judgment == 4) {
        c = "perfect";
        m = 1;
    }
    else if (judgment == 3) {
        c = "great";
        m = 0.8;
    }
    else if (judgment == 2) {
        c = "good";
        m = 0.5;
    }
    else {
        combo = 0;
        c = judgment == 1 ? "bad" : "miss";
        vol -= 0.5 * [1, 0.5, 1, 0][note.type] / (10 + volSP);
    }

    if (judgment > 1) {
        combo++;
        vol += 1.2 * m * [1, 0.5, 1, 5][note.type] / (totalCount - 9);
        if (note.type == 3)
            startEnsembleSuccess();
        else if (note.addEnsemble)
            ensemble += (13 + ensSP) * m * [1, 0.5, 1][note.type] / 10 / totalEnsemble;
    }
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
                i[2] = combo == -1 ? -t : t;
                scoreUp.addClass("in-effect");
                break;
            }
        }
        else if (i[2] > 0 && t - i[2] < i[0])
            mult += i[1] / 100;
    }
        
    showScore(score += Math.round(Math.round(stats * 2 / totalCount) * mult * [1, 0.5, 1, 10][note.type] * m), +chartDiffSelect.val());
    showVoltage(vol);
    showEnsembleGauge(ensemble);

    $("#combo_num").html(combo);
    $("#combo").removeClass("beat")[["show", "hide"][+!combo]]();
    $("#combo").addClass("beat");

    $("#judgment").removeClass("perfect great good bad miss beat2").show();
    $("#judgment").addClass("beat2 " + c).attr("data-judge", w);
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
        $(".ui").addClass("hide-ui");
    else
        endEnsembleTime();
}

function endEnsembleTime() {
    $("#ens_marker").removeClass("ensemble-time");
    $("#ensemble_sp, #ens_gauge").hide();
    $(".ui").removeClass("hide-ui");
    $(".mark > circle, #line > path").each(function() {
        this.setAttribute(this.getAttribute("stroke") ? "stroke" : "fill", "#fff");
    })
    ensemble = -Infinity;
}

function multiplier(x) {
    return 3 ** (x * hiSpeed / 5);
}

function mainLoop(t1 = performance.now()) {    
    ctx.clearRect(0, 0, 2500, 2500);

    let nowTime = VideoSource.player.getCurrentTime() + offset;

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
        endEnsembleTime();

    while (headCursor + 1 < notes.length && notes[headCursor + 1].headTime - 5 / hiSpeed <= nowTime)
        headCursor++;

    if (playMode) {
        for (let x in touches) {
            let touch = touches[x];
            let hasFlickOrTap = false;
            for (let i = tailCursor + 1; i <= headCursor; i++) {
                let note = notes[i];
                if (note.processed)
                    continue;

                let timeDiff = nowTime - note.time;
                let isOnLaneNormal = Math.abs(note.pos - touch.newLane) < 0.5, 
                    isOnLaneFlick = isOnLaneNormal || Math.abs(note.pos - touch.oldLane) < 0.5;
                if (touch.phase == 0) {
                    if (isOnLaneNormal) {
                        if (note.type == 0 || note.type == 3) {
                            if (hasFlickOrTap)
                                continue;

                            if (timeDiff >= -0.04 && timeDiff <= 0.04) 
                                addScore(note, 4);
                            else if (timeDiff >= -0.1 && timeDiff <= 0.1) 
                                addScore(note, 3);
                            else if (timeDiff >= -0.2 && timeDiff <= 0.2) 
                                addScore(note, 2);
                            else if (timeDiff >= -0.4 && timeDiff <= 0.4)
                                addScore(note, 1);
                        }
                        hasFlickOrTap = true;
                    }
                }
                else {
                    if (note.type == 2 && isOnLaneFlick && note.flickDir == touch.flick) {
                        if (timeDiff >= 0.2)
                            addScore(note, 1);
                        else if (timeDiff >= 0.1)
                            addScore(note, 2);
                        else if (timeDiff >= 0.04)
                            addScore(note, 3);
                        else if (timeDiff >= -0.04)
                            addScore(note, 4);
                    }
                    else if (note.type == 1 && isOnLaneNormal) {
                        if (touch.phase == 2) {
                            if (timeDiff >= -0.04 && timeDiff <= 0.04)
                                addScore(note, 4);
                            else if (timeDiff >= -0.1 && timeDiff <= 0.1)
                                addScore(note, 3);
                        }
                        else if (touch.phase == 1) {
                            if (timeDiff >= 0.2)
                                addScore(note, 1);
                            else if (timeDiff >= 0.1)
                                addScore(note, 2);
                            else if (timeDiff >= 0.04)
                                addScore(note, 3);
                            else if (timeDiff >= 0)
                                addScore(note, 4);
                        }
                    }
                }
            }
        }
        for (let i of Object.keys(touches)) {
            if (touches[i].phase == 2)
                delete touches[i];
            else if (touches[i].phase == 0)
                touches[i].phase = 1;
        }
    }

    ctx.save();
    ctx.strokeStyle = "transparent";
    ctx.beginPath();
    ctx.moveTo(450, 1250);
    ctx.lineTo(1155, 1250);
    ctx.arc(1250, 1250, 95, Math.PI, 0, 1);
    ctx.lineTo(2050, 1250);
    ctx.arc(1250, 1250, 800, 0, Math.PI);
    ctx.stroke();
    ctx.clip();

    for (let i = headCursor; i > tailCursor; i--) {
        let note = notes[i];
        if (!note.processed) {
            if (note.follows) {
                let command1 = "", command2 = "", l = note.followPath.length;
                let params = note.followPath.map(function([t, p]) {
                    let m = multiplier(nowTime - t),
                        d = 95 + 705 * (m - 1/3) * 1.5,
                        r = 56 * noteSize * m,
                        a = (270 + 120 * p / (numLanes - 1)) * Math.PI / 180,
                        x = 1250 + d * Math.cos(a),
                        y = 1250 - d * Math.sin(a);
                    return {t, p, m, d, r, a, x, y};
                });
                let movingAngles = params.slice(0, -1).map((n, i) => Math.atan2(n.y - params[i + 1].y, params[i + 1].x - n.x));
                for (let i = 0; i < l - 1; i++) {
                	if (params[i].d < 95 || params[i + 1].d > 800)
                		continue;
                    let dx = params[i].r * Math.cos(movingAngles[i] + quarter),
                        dy = params[i].r * -Math.sin(movingAngles[i] + quarter),
                        dx2 = params[i + 1].r * Math.cos(movingAngles[i] + quarter),
                        dy2 = params[i + 1].r * -Math.sin(movingAngles[i] + quarter);
                    if (command1 == "") {
                        command1 = `M${params[i].x + dx},${params[i].y + dy}`;
                        command2 = `L${params[i].x - dx},${params[i].y - dy} A${params[i].r},${params[i].r},0,0,1,${params[i].x + dx},${params[i].y + dy} Z`;
                    }
                    if (i != l - 2 && movingAngles[i] != movingAngles[i + 1]) {
                        let dir = movingAngles[i + 1] - movingAngles[i];
                        while (dir < 0)
                            dir += twoPI;
                        if (dir < Math.PI) {        // Left turn
                            let newRadius = params[i + 1].r / Math.cos(dir / 2);
                            command1 += ` L${params[i + 1].x + newRadius * Math.cos(movingAngles[i] + (Math.PI + dir) / 2)},${params[i + 1].y - newRadius * Math.sin(movingAngles[i] + (Math.PI + dir) / 2)}`;
                            command2 = `L${params[i + 1].x + params[i + 1].r * Math.cos(movingAngles[i + 1] - quarter)},${params[i + 1].y - params[i + 1].r * Math.sin(movingAngles[i + 1] - quarter)} A${params[i + 1].r},${params[i + 1].r},0,0,1,${params[i + 1].x - dx2},${params[i + 1].y - dy2} ` + command2;
                        }
                        else {                    // Right turn
                            dir = twoPI - dir;
                            let newRadius = params[i + 1].r / Math.cos(dir / 2);
                            command1 += ` L${params[i + 1].x + dx2},${params[i + 1].y + dy2} A${params[i + 1].r},${params[i + 1].r},0,0,1,${params[i + 1].x + params[i + 1].r * Math.cos(movingAngles[i + 1] + quarter)},${params[i + 1].y - params[i + 1].r * Math.sin(movingAngles[i + 1] + quarter)}`;
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
                /*
                w.setAttribute("fill", "#fff9");
                w.setAttribute("stroke-width", 2, "#fff");
                note.holdSegmentElement.setAttribute("d", command1 + command2);
                 */
                ctx.fillStyle = "#fff9";
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 2;
                let path = new Path2D(command1 + command2);
                ctx.fill(path);
                ctx.stroke(path);
            }
        }
    }

    ctx.restore();

    for (let i = headCursor; i > tailCursor; i--) {
        let note = notes[i];
        if (!note.processed && note.time - 5 / hiSpeed <= nowTime && note.simul) 
            drawSimulHint(note.simulHint.angle1, note.simulHint.angle2, multiplier(nowTime - note.time));
    }

    for (let i = headCursor; i > tailCursor; i--) {
        let note = notes[i];
        if (!note.processed) {
            let m = multiplier(nowTime - note.time);
            let angle = (270 + 120 * note.pos / (numLanes - 1)) * Math.PI / 180;
            let radius = 95 + 705 * (m - 1/3) * 1.5;

            if (note.time - 5 / hiSpeed <= nowTime) {
                let notePos = [1250 + radius * Math.cos(angle), 1250 - radius * Math.sin(angle)];
                let mNoteSize = m * noteSize;
                if (note.type == 0) {
                    if (note.isSkill)
                        drawSkillNote(notePos, mNoteSize);
                    else if (note.isHoldHead)
                        drawHoldHead1(notePos, mNoteSize);
                    else
                        drawTapNote1(notePos, mNoteSize);
                }
                else if (note.type == 1)
                    drawHoldKnot1(notePos, mNoteSize);
                else if (note.type == 2) {
                    if (note.flickDir < 0)
                        drawFlickLeft1(notePos, mNoteSize);
                    else
                        drawFlickRight1(notePos, mNoteSize);
                }
                else if (note.type == 3)
                    drawEnsembleNote(notePos, mNoteSize);
            }

            if (!playMode && note.time <= nowTime)
                addScore(note, 4);
            else if (note.time + 0.4 <= nowTime) 
                addScore(note, 0);
        }
    }

    while (tailCursor < headCursor && notes[tailCursor + 1].processed)
        tailCursor++;

    let renderTime = performance.now() - t1;
    if (stopTime > nowTime - offset) {
        //asTimeout = requestAnimationFrame(mainLoop);
        asTimeout = setTimeout(mainLoop, renderTime < 940 / 60 ? 1000 / 60 - renderTime : 1);

        if (fps[0]) 
            fpsShow.text((1200 / (t1 - fps[fpsCursor])).toFixed(2) + ` FPS (Rendering time = ${renderTime} ms)`).show();
        fps[fpsCursor] = t1;
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
    fpsShow.hide();

    if (!manual) {

    }
}

function readChart() {
    touches = {};
    flickDir = {};

    let file = $("#chart").val().replace(levelRegex, "").replace(videoRegex, "").replace(stopRegex, (_, a) => (stopTime = +a) || "");
    bpmTimings = {};
    notes = [];
    ensembleStart = -1;
    ensembleNote = -1;
    ensembleEnd = -1;
    totalCombo = 0;
    totalCount = 0;
    totalSkills = 0;
    totalEnsemble = 0;
    let section = 1, bar = 0, beat = 0, time = 0, follow = [];

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
        else {
            let isFollow = !!match[10];

            if (match[11]) {
                if (match[24])
                    time = +match[24];
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
            else {
                let note = {
                    time, 
                    headTime: time,
                    type: match[25][0] == "!" ? 3 : match[26] ? "OSLR".indexOf(match[26]) > 1 ? 2 : +isFollow : -1,
                    pos: match[25][0] == "!" ? 0 : +match[27],
                    isSkill: match[26] == "S",
                    isHoldHead: false,
                    flickDir: ("L.R".indexOf(match[26]) - 1) % 2,
                    follows: null,
                    followPath: [],
                    addEnsemble: false,
                    processed: false,
                    simul: null,
                    simulHint: null                
                };

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

    notes.sort((a, b) => a.time - b.time).map(function (_, i) {
        if (i > 0 && notes[i].time == notes[i - 1].time && notes[i].type != 1 && notes[i - 1].type != 1) {
            notes[i].simul = notes[i - 1];
            notes[i - 1].simul = notes[i];
            
            notes[i].simulHint = notes[i - 1].simulHint = {
                angle1: Math.max(notes[i].pos, notes[i - 1].pos),
                angle2: Math.min(notes[i].pos, notes[i - 1].pos)
            };
        }
    });
    notes.sort((a, b) => a.headTime - b.headTime);
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
        $("#voltage_sp")[["show", "hide"][+!volSP]]();
        $("#ensemble_sp").hide();
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
    endEnsembleTime();
}).trigger("click");

$("#setting_yt").on("submit", function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.checkValidity())
        VideoSource.loadYouTube($("#yt_videoid").val());
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

$("input[type=range]").on("input", function(e) {
    let a = $(`.range-value[data-value=${e.target.id}]`)[0];
    let separator = a.dataset.separator || "";
    let value = a.dataset.fixed 
                ? (+e.target.value).toFixed(a.dataset.fixed).replace(/\d+?(?=(\d{3})+[^\d])/g, `$&${separator}`)
                : e.target.value.replace(/(\d)(\d{2})(?=\d(\d{3})*(\.|$))/g, `$1${separator}$2`);
    a.innerHTML = a.dataset.format.replace("_", value);
});

$("#fs").on("click", function() {
    if (!document.fullscreenEnabled)
        return;
    if (document.fullscreenElement || document.mozFullScreenElement 
        || document.webkitFullscreenElement || document.msFullscreenElement)
        document.exitFullscreen();
    else
        document.body.requestFullscreen();
});


chartDiffSelect.on("change", function() {
    loadJudgmentLine(numLanes = this.value < 2 ? 7 : 9);
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
        chartDiffSelect.val(levelDefinition[2] ? 0 : levelDefinition[3] ? 1 : levelDefinition[4] ? 2 : 3).trigger("change");
        $("#chart_lvl").val(levelDefinition[6]).trigger("input");
    }

    let videoDefinition = videoRegex.exec(file);
    if (videoDefinition) {
        $("#yt_videoid").val(videoDefinition[1]).trigger("change");
        if (VideoSource)
            $("#setting_yt").trigger("submit");
    }
});

$("*[data-storable]").each(function() {
    if (window.localStorage.getItem(this.id))
        this.value = window.localStorage.getItem(this.id);
}).trigger("input").trigger("change").on("change", function() {
    window.localStorage.setItem(this.id, this.value);
});

window.onresize();
