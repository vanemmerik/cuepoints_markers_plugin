videojs.registerPlugin('cuePointPlugin', function(options) {
	var player = this;
    player.on('loadedmetadata', function() {
        let cuePointsArr = new Array(),
            tt = player.textTracks()[0],
            videoDuration = player.mediainfo.duration,
            longDesc = player.mediainfo.longDescription;
        cuePointsArr = player.mediainfo.cuePoints;
        xtractMatch(longDesc, cuePointsArr, videoDuration);
        cuePointsArr = cuePointsArr.filter(cue => (cue.type === 'CODE') || (cue.type === 'TEXT'));
        displayMetaInfo(tt, player);
        addCueEl(cuePointsArr, videoDuration);
    })
});

const xtractMatch = (string, arr, videoDuration) => {
    let timeRe = new RegExp(/((?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d))|((?:[01]\d|2[0123]):(?:[012345]\d)|(?:\d:[0-5][0-9]))/gm),
        descRe = new RegExp(/(([\d]:[\d][\d]:[\d][\d])|([\d][\d]:[\d][\d]:[\d][\d])|([\d][\d]:[\d][\d])|([\d]:[\d][\d]))/gm),
        chapters = string.match(timeRe);
    for (let i = 0; i < chapters.length; i++) {
        let time =  chapters[i].split(':'),
            seconds,
            idNum = Math.floor(Math.random() * 9000000000000) + 1000000000000;
        if (time.length === 2){
            seconds = (Number.parseFloat(time[0]) * 60 + Number.parseFloat(time[1]));
            if (seconds > videoDuration){
                continue;
            }
            arr.push({
                id: `${idNum}`,
                name: 'TBC',
                type: 'TEXT',
                time: seconds,
                metadata: '',
                startTime: seconds,
                endTime: ''
            });
        }
        if (time.length === 3){
            seconds = (Number.parseFloat(time[0]) * 3600 + Number.parseFloat(time[1]) * 60 + Number.parseFloat(time[2]));
            if (seconds > videoDuration){
                continue;
            }
            arr.push({
                id: `${idNum}`,
                name: 'TBC',
                type: 'TEXT',
                time: seconds,
                metadata: '',
                startTime: seconds,
                endTime: ''
            });
        }
    }
    arrSort(arr);
}

const arrSort = (arr) => {
    arr.sort((a, b) => {
        return a.time - b.time;
    });
}

const displayMetaInfo = (tt, player) => {
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
}

function addCueEl(arr, videoDuration) {
    let playerWidth = document.querySelector('video-js').offsetWidth,
        controlBar = document.querySelector('.vjs-progress-control'),
        progresBar = document.querySelector('.vjs-progress-holder'),
        cueControl = document.createElement('div'),
        cueTip = document.createElement('div');
    cueTip.className = 'vjs-cue-tip';
    cueControl.className = 'vjs-cue-control';
    cueControl.style.setProperty('--cue-control-width', playerWidth + 'px');
    controlBar.prepend(cueControl);
    progresBar.appendChild(cueTip);
    for (let i = 0; i < arr.length; i++) {
        let el = document.createElement('div');
        el.className = 'vjs-cue-marker';
        el.id = 'marker' + i;
        el.style.setProperty('--marker-color', options.cueMarkerColor);
        el.addEventListener("mouseover", (e) => {
            setCueInfo(e, arr);
        });
        var time = arr[i].time;
            segment = playerWidth / time;
        if (segment === Infinity){
            segment = 0;
        }
        el.style.left = `${Math.round(time / videoDuration * playerWidth)}px`; // Based on proportion of width using time 
        cueControl.append(el);
    }
    creatCueInfoElem();
}

const creatCueInfoElem = () => {
    let cueTipData = document.createElement('p'),
        cueTip = document.querySelector('.vjs-cue-tip');
    cueTipData.className = 'vjs-cue-data';
    cueTip.appendChild(cueTipData);
}

const setCueInfo = (e, arr) => {
    let i = e.target.id.slice(-1),
        cueHolder = document.querySelector('.vjs-cue-control').offsetWidth,
        cueMarker = document.querySelectorAll('.vjs-cue-marker')[i],
        cueTip = document.querySelector('.vjs-cue-tip'),
        cueTipData = document.querySelector('.vjs-cue-data');
    cueTip.classList.add('vjs-cue-tip-visible');
    cueTipData.innerHTML = `${arr[i].name}`;
    if (cueMarker.offsetLeft > cueHolder / 2){
        cueTip.classList.add('vjs-cue-right');
        cueTip.style.right = cueHolder - cueMarker.offsetLeft +15 + 'px';
    } else {
        cueTip.style.left = cueMarker.offsetLeft +20 + 'px';
        cueTip.classList.add('vjs-cue-left');
    }
    if (arr[i].name === '') {
        cueTipData.classList.add('vjs-cue-data-hidden');
    }
    if (i == arr.length - 1) {
        cueMarker.classList.add('vjs-cue-marker-last');
    }
    cueMarker.addEventListener('mousemove', (e) => {
        cueTip.style.top = e.offsetY - 27 + 'px';
    });
    cueMarker.addEventListener('mouseout', () => {
        cueTip.removeAttribute('style');
        cueTip.classList.remove('vjs-cue-tip-visible');
        cueTip.classList.remove('vjs-cue-left');
        cueTip.classList.remove('vjs-cue-right');
        cueTipData.classList.remove('vjs-cue-data-hidden');
    });
}
