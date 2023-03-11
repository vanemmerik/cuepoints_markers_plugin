videojs.registerPlugin('cuePointPlugin', function() {
	var player = this;
    player.one('loadedmetadata', function() {
        let cuePointsAra = new Array(),
            codeCuePointsAra = new Array(),
            timeCuePointsArr = new Array(),
            longDescChapters = new Array(),
            tt = player.textTracks()[0],
            videoDuration = player.mediainfo.duration;
        cuePointsAra = player.mediainfo.cuePoints;
        codeCuePointsAra = cuePointsAra.filter(isCodeCuePoint);
        if (codeCuePointsAra.length <= 0) {
            console.log(`Get the chapters from the long desc field ${longDescChapters}`);
        } else {
            timeCuePointsArr = cuePointsAra.filter(isCodeCuePoint);
        }
        bulidCueControlBarArr(timeCuePointsArr, codeCuePointsAra);
        addCodeMarkers(cuePointsAra, videoDuration, timeCuePointsArr);
        tt.oncuechange = function () {
            if (tt.activeCues[0] !== undefined) {
            var dynamicHTML_AC = "id: " + tt.activeCues[0].originalCuePoint.id + ", ";
            dynamicHTML_AC += "name: " + tt.activeCues[0].originalCuePoint.name + ", ";
            dynamicHTML_AC += "startTime: " + tt.activeCues[0].startTime + ",  ";
            dynamicHTML_AC += "endTime: " + tt.activeCues[0].endTime;
            document.getElementById("insertionPoint_AC").innerHTML += dynamicHTML_AC + "<br/>";
            }
        }
        let dynamicHTML_C = "",
            dynamicHTML_MI = "";
        for (i = 0; i < tt.cues.length; i++ ) {
            dynamicHTML_C += "id: " + tt.cues[i].originalCuePoint.id + ", ";
            dynamicHTML_C += "name: " + tt.cues[i].originalCuePoint.name + ", ";
            dynamicHTML_C += "startTime: " + tt.cues[i].startTime + ", ";
            dynamicHTML_C += "endTime: " + tt.cues[i].endTime + "<br/>";
        }
        document.querySelector("#insertionPoint_C").innerHTML = dynamicHTML_C;
        for (i = 0; i < player.mediainfo.cuePoints.length; i++ ) {
            dynamicHTML_MI += "id: " + player.mediainfo.cuePoints[i].id + ", ";
            dynamicHTML_MI += "name: " + player.mediainfo.cuePoints[i].name + ", ";
            dynamicHTML_MI += "startTime: " + player.mediainfo.cuePoints[i].startTime + ", ";
            dynamicHTML_MI += "endTime: " + player.mediainfo.cuePoints[i].endTime + "<br/>";
        }
        document.querySelector("#insertionPoint_MI").innerHTML = dynamicHTML_MI;
    })
});

function isCodeCuePoint(cuePoint) {
    return cuePoint.type === 'CODE';
}

function addCodeMarkers(cuePointsAra, videoDuration, timeCuePointsArr) {
    let iMax = timeCuePointsArr.length,
        i,
        playheadWell = document.getElementsByClassName('vjs-progress-holder')[0],
        cueTip = document.createElement('div');
    cueTip.className = 'vjs-cue-tip';
    playheadWell.appendChild(cueTip);
    for (i = 0; i < iMax; i++) {
        var elem = document.createElement('div');
        elem.className = 'vjs-cue-marker';
        elem.id = 'marker' + i;
        elem.addEventListener("mouseover", (e) => {
            setCueInfo(e, timeCuePointsArr);
        });
        // elem.style.left = (codeCuePointsAra[i].time / videoDuration) * 100 + '%';
        playheadWell.appendChild(elem);
        buildCueSections(timeCuePointsArr, i, videoDuration);
    }
    creatCueInfoElem();
}

const bulidCueControlBarArr = (timeCuePointsArr, codeCuePointsAra) => {
    if (timeCuePointsArr[0].time != 0) {
        timeCuePointsArr.unshift({
            time: 0,
            startTime: 0,
            endTime: codeCuePointsAra[0].time,
            name: ''
        });
    }
    timeCuePointsArr.sort((a, b) => {
        return a.time - b.time;
    });
}

const buildCueSections = (timeCuePointsArr, i, videoDuration) => {
    let markerId = document.querySelector('#marker' + [i]);
    if (i === 0) {
        markerId.style.left = `${timeCuePointsArr[i].startTime / videoDuration * 100}%`;
        markerId.style.width = `${timeCuePointsArr[i].endTime / videoDuration * 100}%`;
    } else {
        markerId.style.left = `${timeCuePointsArr[i].startTime / videoDuration * 100}%`;
        markerId.style.width = `${timeCuePointsArr[i].endTime / videoDuration * 100 - timeCuePointsArr[i].startTime / videoDuration * 100}%`;
    }
}

const creatCueInfoElem = () => {
    let cueTipData = document.createElement('p'),
        cueTip = document.querySelector('.vjs-cue-tip');
    cueTipData.className = 'vjs-cue-data';
    cueTip.appendChild(cueTipData);
}

const setCueInfo = (e, timeCuePointsArr) => {
    let i = e.target.id.slice(-1),
        progBarWidth = document.getElementsByClassName('vjs-progress-holder')[0].offsetWidth,
        cueMarker = document.querySelectorAll('.vjs-cue-marker')[i],
        cueTip = document.querySelector('.vjs-cue-tip'),
        cueTipData = document.querySelector('.vjs-cue-data');
    cueTip.classList.add('vjs-cue-tip-visible');
    cueTipData.innerHTML = `${timeCuePointsArr[i].name}`;
    if (cueMarker.offsetLeft > progBarWidth / 2){
        cueTip.classList.add('vjs-cue-right');
        cueTip.style.right = progBarWidth - cueMarker.offsetLeft +15 + 'px';
    } else {
        cueTip.style.left = cueMarker.offsetLeft +20 + 'px';
        cueTip.classList.add('vjs-cue-left');
    }
    if (timeCuePointsArr[i].name === '') {
        cueTipData.classList.add('vjs-cue-data-hidden');
    }
    if (i == timeCuePointsArr.length - 1) {
        cueMarker.classList.add('vjs-cue-marker-last');
    }
    cueMarker.addEventListener('mousemove', (e) => {
        cueTip.style.top = e.offsetY -22 + 'px';
    });
    cueMarker.addEventListener('mouseout', () => {
        cueTip.removeAttribute('style');
        cueTip.classList.remove('vjs-cue-tip-visible');
        cueTip.classList.remove('vjs-cue-left');
        cueTip.classList.remove('vjs-cue-right');
        cueTipData.classList.remove('vjs-cue-data-hidden');
    });
}
