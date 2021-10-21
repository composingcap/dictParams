const Max = require('max-api');

var paramDictName = "";
var duration = 5000;
var grain = 20;
var lastTime = 0;
var lerperOn = 0;
var paused = 0;
var interpDicts = [];
var removeDicts = []

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);


Max.addHandler("interp", (dname) => {

	Max.getDict(dname).then((dataInterp) => {

		interpDict = dataInterp;



		Max.getDict(paramDictName).then((dataDict) => {

			interpDict.startTime = process.hrtime()[1] / 1000000;
			interpDict.currentTime = 0;
			interpDict.targets = [];
			interpDict.endVals = {};
			interpDict.startVals = {};

			for (var [key, value] of Object.entries(interpDict.preset.params)) {
				Max.outlet("param", value.param, value.value);
				var datakey = value.param.split(/[\/,\.,\(::\)]+/);
				var datastring = "dataDict"
				for (var l of datakey) {
					datastring += "[\"" + l + "\"]";
				}
				eval(datastring + "= " + value.value);

			}
			if (interpDict.preset.message != undefined) {
				Max.outlet(["message", interpDict.preset.message]);
			}



			for (var [key, value] of Object.entries(interpDict.params)) {
				var datakey = value.param.split(/[\/,\.,\(::\)]+/);
				var datastring = "dataDict"
				for (var l of datakey) {
					datastring += "[\"" + l + "\"]";
				}
				interpDict.startVals[value.param] = eval(datastring);
				interpDict.endVals[value.param] = value.value;

			}

			interpDicts.push(interpDict);


			if (!lerperOn) {
				lerperOn = 1;
				lastTime = interpDict.startTime;
				setTimeout(timerLoop, 0);
			}
		})
	});

});

Max.addHandler("dictName", (dname) => {
	paramDictName = dname;
});



function timerLoop() {
	var thisTime = process.hrtime()[1] / 1000000;
	if (paused) {
		lastTime = thisTime;
	}
	else{
		
		var deltaTime = Math.abs(thisTime - lastTime);
		lastTime = thisTime;



		removeDicts = [];

		for (var i = 0; i < interpDicts.length; i++) {

			d = interpDicts[i];

			if (d.currentTime >= (d.duration + d.delay)) {
				removeDicts.push(i)
				if (d.callback != undefined) {
					Max.outlet(["callback", d.callback]);
				}

				continue;
			}




			d.currentTime += deltaTime;
			if (d.currentTime < d.delay) continue;

			for (var [key, value] of Object.entries(d.params)) {
				var p = d.currentTime / d.duration;
				p = clamp(p, 0, 1);
				var thisVal = d.startVals[value.param] * (1 - p) + d.endVals[value.param] * p;
				Max.outlet(["param", value.param, thisVal]);

			}

			var removeTriggers = [];
			for (var [key, value] of Object.entries(d.triggers)) {
				var absTime;

				if (value.time instanceof String || typeof value.time === 'string') {
					absTime = parseFloat(value.time.split("ms")[0])

				} else {
					absTime = value.time * d.duration

				}

				if ((d.currentTime-d.delay) >= absTime) {
					removeTriggers.push(key);
					if (value.param != undefined && value != undefined) {
						Max.outlet(["param", value.param, value.value]);
					}
					if (value.message != undefined) {
						Max.outlet(["message", value.message]);
					}

				}

			}

			for (var key of removeTriggers) {
				delete  d.triggers[key];

			}

		}

		for (var i = 0; i < removeDicts.length; i++) {

			interpDicts.splice(removeDicts[i])
		}
	}


		if (interpDicts.length > 0) {
			setTimeout(timerLoop, grain);
		} else {
			lerperOn = 0;
		}
	



}

Max.addHandler("stop", () => {
	interpDicts = []
});
Max.addHandler("pause", () => {
	paused = 1
});
Max.addHandler("resume", () => {
	paused = 0
});
