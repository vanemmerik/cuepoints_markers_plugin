videojs.registerPlugin('cuePointPlugin', function(options) {
	var player = this;
    player.on('loadedmetadata', function() {
        let cuePointsArr = new Array(),
            videoDuration = player.mediainfo.duration,
            longDesc = player.mediainfo.longDescription;
        cuePointsArr = player.mediainfo.cuePoints; // Add existing cue point metadata to the cue points array
        xtractMatch(longDesc, cuePointsArr, videoDuration); // Check for chapters in the longDescription metadata field, sort and merge
        cuePointsArr = cuePointsArr.filter(cue => (cue.type === 'CODE') || (cue.type === 'TEXT')); // Filter ad cue points out of the array
        cuePointsArr = dedupeArr(cuePointsArr); // Remove duplicates based on time
        assignCueEndTime(cuePointsArr,videoDuration); // Assign endTime to cue points in sorted array
        addCueEl(cuePointsArr, videoDuration, options); // Take formatted cue point information and add cue markers to player progress bar
    })
});

const xtractMatch = (string, arr, videoDuration) => {
    let tRex = new RegExp(/(^(?:[01]\d|2[0-3]|[0-59]):[0-5]\d:[0-5]\d)|(^(?:[0-5]\d|2[123]|[0-59]):[0-5]\d)/gm), // Match time formats M:SS, MM:SS, HH:MM:SS, H:MM:SS 
        dRex = new RegExp(/^.*?(^[0-5][0-9]:|^[0-59]:).*$/gm), // Match whole line that begins with 00: Lines with time not at the start are ignored
        chaptrTime = string.match(tRex),
        chaptrName = string.match(dRex);
    if (chaptrTime === null) return(arrSort(arr)); // No found chapters sort the array as it is
    for (let i = 0; i < chaptrTime.length; i++) {
        let time = chaptrTime[i].split(':'),
            description = chaptrName[i].slice(chaptrTime[i].length),
            seconds,
            idNum = Math.floor(Math.random() * 9000000000000) + 1000000000000;
        description = stringTidy(description); // Strip hyphens and other intersting chars from string and trim whitespace
        timeConversion(arr, time, idNum, seconds, description, videoDuration); // push into array objects
    }
    arrSort(arr); // Sort array based on time - lowest to highest
}

// Array sort function
const arrSort = (arr) => {
    arr.sort((a, b) => {
        return a.time - b.time;
    });
}

// Removal of hyphens, pluses but allows inverted commas etc
const stringTidy = (str) => {
    str = str.replace(/([.,\/;:{}=\-_~()<>{}+])/g, '');
    str = str.trim(); // Remove whitespace form either end of the string
    return(str);
}

const timeConversion = (arr, time, idNum, seconds, description, duration, i) => {
    if (description.match(/\b[^\d\W]+\b/g) === null) description = ''; // Check for words in description
    if (time.length === 2){
        seconds = (Number.parseFloat(time[0]) * 60 + Number.parseFloat(time[1])); // Convert MM:SS to seconds
        if (seconds > duration) return; // If chapter is longer than the video skip
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
        seconds = (Number.parseFloat(time[0]) * 3600 + Number.parseFloat(time[1]) * 60 + Number.parseFloat(time[2])); // Convert HH:MM:SS to seconds
        if (seconds > duration) return; // If chapter is longer than the video skip
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

// Filter array through map - remove duplicates
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

// Hacky method to reassign endTime cue data in Array
const assignCueEndTime = (arr, duration) => { 
    let v = 1;
    for (let i = 0; i < arr.length; i++) {
        if (v <= arr.length - 1)arr[i].endTime = arr[v].time;
        if (v === arr.length) arr[i].endTime = duration;
        v++;
    }   
}

// Build cue point markers and add them to the player progress bar
const addCueEl = (arr, videoDuration, options) => {
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
    for (let i = 0; i < arr.length; i++) { // Loop through array and add elements
        let el = document.createElement('div');
        el.className = 'vjs-cue-marker';
        el.id = 'marker' + i;
        el.style.setProperty('--marker-color', options.cue_marker_color);
        el.addEventListener("mouseover", (e) => { // Add mouse event listener to cue marker elements
            setCueInfo(e, arr);
        });
        let time = arr[i].time;
        el.style.left = `${Math.round(time / videoDuration * playerWidth)}px`; // Based on proportion of width px using time 
        cueControl.append(el);
    }
    createCueInfoEl();
}

// Create and introduce to DOM the information tool data
const createCueInfoEl = () => {
    let cueTipData = document.createElement('p'),
        cueTip = document.querySelector('.vjs-cue-tip');
    cueTipData.className = 'vjs-cue-data';
    cueTip.appendChild(cueTipData);
}

// Control mouse interaction with the cue markers - Initiated on hover state
const setCueInfo = (e, arr) => {
    let i = e.target.id.slice(6),
        cueHolder = document.querySelector('.vjs-cue-control').offsetWidth,
        cueMarker = document.querySelectorAll('.vjs-cue-marker')[i],
        cueTip = document.querySelector('.vjs-cue-tip'),
        cueTipData = document.querySelector('.vjs-cue-data');
    cueTip.classList.add('vjs-cue-tip-visible');
    cueTipData.innerHTML = `${arr[i].name}`;
    if (cueMarker.offsetLeft > cueHolder / 2){ // Display cue tool tip on left or right of marker on hover based on position
        cueTipData.classList.add('vjs-cue-data-left');
        cueTip.style.right = cueHolder - cueMarker.offsetLeft +20 + 'px';
    } else {
        cueTip.style.left = cueMarker.offsetLeft +20 + 'px';
        cueTipData.classList.add('vjs-cue-data-right');
    }
    if (arr[i].name === '') cueTipData.classList.add('vjs-cue-data-hidden');
    if (i == arr.length - 1) cueMarker.classList.add('vjs-cue-marker-last');
    cueMarker.addEventListener('mousemove', (e) => { // Follow the pointer on Y axis only
        cueTip.style.top = e.offsetY - 27 + 'px';
    });
    cueMarker.addEventListener('mouseout', () => { // On mouse out - remove inline styles and classes
        cueTip.removeAttribute('style');
        cueTip.classList.remove('vjs-cue-tip-visible');
        cueTipData.classList.remove('vjs-cue-data-left');
        cueTipData.classList.remove('vjs-cue-data-right');
        cueTipData.classList.remove('vjs-cue-data-hidden');
    });
}
