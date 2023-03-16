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
        cuePointsArr = dedupeArr(cuePointsArr);
        assignCueEndTime(cuePointsArr);
        addCueEl(cuePointsArr, videoDuration);
        displayMetaInfo(tt, cuePointsArr);
    })
});

const xtractMatch = (string, arr, videoDuration) => {
    let tRex = new RegExp(/(^(?:[01]\d|2[0-3]|[0-59]):[0-5]\d:[0-5]\d)|(^(?:[0-5]\d|2[123]|[0-59]):[0-5]\d)/gm),
        dRex = new RegExp(/^.*?(^[0-5][0-9]:|^[0-59]:).*$/gm),
        chaptrTime = string.match(tRex),
        chaptrName = string.match(dRex);
    for (let i = 0; i < chaptrTime.length; i++) {
        let time = chaptrTime[i].split(':'),
            description = chaptrName[i].slice(chaptrTime[i].length),
            seconds,
            idNum = Math.floor(Math.random() * 9000000000000) + 1000000000000;
        description = stringTidy(description);
        timeConversion(arr, time, idNum, seconds, description, videoDuration);
    }
    arrSort(arr);
}

const arrSort = (arr) => {
    arr.sort((a, b) => {
        return a.time - b.time;
    });
}

const stringTidy = (str) => {
    str = str.replace(/([.,\/;:{}=\-_~()<>{}+])/g, '');
    str = str.trim();
    return(str);
}

const timeConversion = (arr, time, idNum, seconds, description, duration, i) => {
    if (description.match(/\b[^\d\W]+\b/g) === null) description = '';
    if (time.length === 2){
        seconds = (Number.parseFloat(time[0]) * 60 + Number.parseFloat(time[1]));
        if (seconds > duration) return;
        arr.push({
            id: `${idNum}`,
            name: description,
            type: 'TEXT',
            time: seconds,
            metadata: description,
            startTime: seconds,
            endTime: ''
        });
    }
    if (time.length === 3){
        seconds = (Number.parseFloat(time[0]) * 3600 + Number.parseFloat(time[1]) * 60 + Number.parseFloat(time[2]));
        if (seconds > duration) return;
        arr.push({
            id: `${idNum}`,
            name: description,
            type: 'TEXT',
            time: seconds,
            metadata: description,
            startTime: seconds,
            endTime: ''
        });
    }
}

const dedupeArr = (arr) => {
    let mapObj = new Map()
    arr.forEach(v => {
        let prevValue = mapObj.get(v.time)
        if(!prevValue){
            mapObj.set(v.time, v)
        } 
    })
    return [...mapObj.values()];
}

const assignCueEndTime = (arr, i) => {
    let j = new Array(),
        next = -1;
        for (j = i + 1; j < arr.length; j++)
        {
            if (arr[i].time < arr[j]){
            next = arr[j];
            break;
        }
    }
    console.log(arr);
}

const displayMetaInfo = (tt, arr) => {
    tt.oncuechange = function () {
        if (tt.activeCues[0] !== undefined) {
        var dynamicHTML_AC = "id: " + tt.activeCues[0].originalCuePoint.id + ", ";
        dynamicHTML_AC += "type: " + tt.activeCues[0].originalCuePoint.type + ", ";
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
        dynamicHTML_C += "type: " + tt.cues[i].originalCuePoint.type + ", ";
        dynamicHTML_C += "name: " + tt.cues[i].originalCuePoint.name + ", ";
        dynamicHTML_C += "startTime: " + tt.cues[i].startTime + ", ";
        dynamicHTML_C += "endTime: " + tt.cues[i].endTime + "<br/>";
    }
    document.querySelector("#insertionPoint_C").innerHTML = dynamicHTML_C;
    for (i = 0; i < arr.length; i++ ) {
        dynamicHTML_MI += "id: " + arr[i].id + ", ";
        dynamicHTML_MI += "type: " + arr[i].type + ", ";
        dynamicHTML_MI += "name: " + arr[i].name + ", ";
        dynamicHTML_MI += "startTime: " + arr[i].startTime + ", ";
        dynamicHTML_MI += "endTime: " + arr[i].endTime + "<br/>";
    }
    document.querySelector("#insertionPoint_MI").innerHTML = dynamicHTML_MI;
}

const addCueEl = (arr, videoDuration) => {
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
        el.style.setProperty('--marker-color', options.cue_marker_color);
        el.addEventListener("mouseover", (e) => {
            setCueInfo(e, arr);
        });
        var time = arr[i].time;
            segment = playerWidth / time;
        if (segment === Infinity) segment = 0;
        el.style.left = `${Math.round(time / videoDuration * playerWidth)}px`; // Based on proportion of width using time 
        cueControl.append(el);
    }
    creatCueInfoEl();
}

const creatCueInfoEl = () => {
    let cueTipData = document.createElement('p'),
        cueTip = document.querySelector('.vjs-cue-tip');
    cueTipData.className = 'vjs-cue-data';
    cueTip.appendChild(cueTipData);
}

const setCueInfo = (e, arr) => {
    let i = e.target.id.slice(6),
        cueHolder = document.querySelector('.vjs-cue-control').offsetWidth,
        cueMarker = document.querySelectorAll('.vjs-cue-marker')[i],
        cueTip = document.querySelector('.vjs-cue-tip'),
        cueTipData = document.querySelector('.vjs-cue-data');
    cueTip.classList.add('vjs-cue-tip-visible');
    cueTipData.innerHTML = `${arr[i].name}`;
    if (cueMarker.offsetLeft > cueHolder / 2){
        cueTipData.classList.add('vjs-cue-data-left');
        cueTip.style.right = cueHolder - cueMarker.offsetLeft +20 + 'px';
    } else {
        cueTip.style.left = cueMarker.offsetLeft +20 + 'px';
        cueTipData.classList.add('vjs-cue-data-right');
    }
    if (arr[i].name === '') cueTipData.classList.add('vjs-cue-data-hidden');
    if (i == arr.length - 1) cueMarker.classList.add('vjs-cue-marker-last');
    cueMarker.addEventListener('mousemove', (e) => {
        cueTip.style.top = e.offsetY - 27 + 'px';
    });
    cueMarker.addEventListener('mouseout', () => {
        cueTip.removeAttribute('style');
        cueTip.classList.remove('vjs-cue-tip-visible');
        cueTipData.classList.remove('vjs-cue-data-left');
        cueTipData.classList.remove('vjs-cue-data-right');
        cueTipData.classList.remove('vjs-cue-data-hidden');
    });
}
