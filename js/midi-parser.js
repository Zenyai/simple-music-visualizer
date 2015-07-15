// Constants
var ONE_MINUTE_MS = 60000;
var ONE_MINUTE_S = 60;
var MPB_CONVERTER = 1000000;

function fetchMidi(path, callback) {
	var fetch = new XMLHttpRequest();
	fetch.open('GET', path);
	fetch.overrideMimeType("text/plain; charset=x-user-defined");
	fetch.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			/* munge response into a binary string */
			var t = this.responseText || "" ;
			var ff = [];
			var mx = t.length;
			var scc= String.fromCharCode;
			for (var z = 0; z < mx; z++) {
				ff[z] = scc(t.charCodeAt(z) & 255);
			}
			callback(ff.join(""));
		}
	}
	fetch.send();
}

function tickToMilliseconds(tick, bpm, resolution) {
	return (tick * ONE_MINUTE_MS) / (resolution * bpm)
}

function bpmToMpb(bpm) {
	return ONE_MINUTE_S * MPB_CONVERTER / bpm
}

function initMidiFile(midiFile, bpm) {
	var clone = $.extend({}, midiFile);
	var microsecondsPerBeat = bpmToMpb(bpm)

	// go through all tracks
	$.each(clone.tracks, function(i, events) {
		var newEvents = [];

		// filter out all setTempo events
		$.each(events, function(j, e) {
			if (e.type !== "meta" && e.subtype !== "setTempo") {
				newEvents.push(e);
			}
		});

		// create a new setTempo event
		newEvents.unshift({
			deltaTime: 0,
			microsecondsPerBeat: microsecondsPerBeat,
			subtype: "setTempo",
			type: "meta"
		});

		// replace the events in the track
		clone.tracks[i] = newEvents;
	});

	// attach bpm to header
	clone.header.bpm = bpm;

	return clone;
}

function parseEvents(midiFile, trackNo) {
	var track = midiFile.tracks[trackNo];
	var bpm = midiFile.header.bpm;
	var resolution = midiFile.header.ticksPerBeat;

	var parsed = [];
	var timePassed = 0.0;

	// loop through the track and parse the events
	$.each(track, function(i, e) {
		var tick = e.deltaTime;
		var milliseconds = tickToMilliseconds(tick, bpm, resolution);

		timePassed += milliseconds;

		var roundedTime = Math.ceil(timePassed);

	    if (e.type === "channel" && e.subtype === "noteOn") {
	    	parsed.push({
	    		pitch: e.noteNumber,
	    		velocity: e.velocity,
	    		start: roundedTime
	    	});
	    }
	    else if (e.type === "channel" && e.subtype === "noteOff") {
	    	var cnt = parsed.length - 1;
			while (cnt > 0) {
				if (parsed[cnt] && parsed[cnt].pitch == e.noteNumber) {
					parsed[cnt].end = roundedTime;
					break;
				}

				cnt--;
			}
	    }
	});

	return parsed;
}

function groupEvents(events) {
	var group = {};

	$.each(events, function(i, e) {
		if (group[e.start] === undefined) {
			group[e.start] = [];
		}

		group[e.start].push(e);
	});

	return group;
}

function generateSequence(events, bpm) {
	var sequence = {};
	var group = groupEvents(events);

	// 1: 1/4
	// 2: 1/8
	// 4: 1/16
	var slice = 2;

	var interval = Math.ceil(ONE_MINUTE_MS / bpm / slice);
	var endTime = events[events.length - 1].start;
	var current = 0;

	while (current < endTime + interval) {
		var e = group[current];

		if (e) {
			var jump = function() {
				var sum = 0;
				$.each(e, function(k, v) {
					sum += v.velocity;
				});

				return ((sum / e.length) * 10) - 180;
			};

			var speed = function() {
				var normal = 150;
				var addValue = 15;

				var prev = group[current - interval];

				if (prev) {
					var prevMaxPitch = -1;
					for (i in prev) {
						if (prev[i].pitch > prevMaxPitch) {
							prevMaxPitch = prev[i].pitch;
						}
					}

					var maxPitch = -1;
					for (i in e) {
						if (e[i].pitch > maxPitch) {
							maxPitch = e[i].pitch;
						}
					}
					
					if (maxPitch - prevMaxPitch > 0) {
						return normal + addValue;
					}
					else {
						return normal - addValue;
					}
				}

				return normal;
			};

			var gravity = function() {
				var sum = 0;
				$.each(e, function(k, v) {
					sum += v.pitch;
				});

				return ((sum / e.length) * 10) + Math.floor(jump());
			};

			// insert event into sequence
			sequence[current] = {
				jump: jump(),
		      	speed: speed(),
		      	gravity: gravity()
			}
		}
		else {
			// insert event into sequence
			sequence[current] = {
				hide: 1
			}
		}

		current += interval
	}

	return sequence;
}