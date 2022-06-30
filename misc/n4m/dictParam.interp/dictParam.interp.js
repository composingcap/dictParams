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


var EasingFunctions = require('easing-utils');

var createNestedObject = function( base, names, value ) {

	if (typeof value == "string") value = value.split(" ").map(Number);

    // If a value is given, remove the last name and keep it for later:
    var lastName = arguments.length === 3 ? names.pop() : false;

    // Walk the hierarchy, creating new objects where needed.
    // If the lastName was removed, then the last object is not set yet:
    for( var i = 0; i < names.length; i++ ) {
        base = base[ names[i] ] = base[ names[i] ] || {};
    }

    // If a value was given, set it to the last name:
    if( lastName ) base = base[ lastName ] = value;

    // Return the last object in the hierarchy:
    return base;
};
Object.byString = function(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
}


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
				
				var temp = {};

				createNestedObject(dataDict, datakey, value.value);


			}
			if (interpDict.preset.message != undefined) {
				Max.outlet(["message", interpDict.preset.message]);
			}



			for (var [key, value] of Object.entries(interpDict.params)) {
				var datakey = value.param.split(/[\/,\.,\(::\)]+/);
				var datastring = datakey[0];
				datakey.shift();
				for (var l of datakey) {
					datastring += "." + l;
				}
				
				interpDict.startVals[value.param]  = Object.byString(dataDict, datastring);
				if (typeof value.value == "string") value.value = value.value.split(" ").map(Number);
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

			var p = d.currentTime / d.duration;
				
			p = clamp(p, 0, 1);
			var e = p;
			
			if (interpDict.function != undefined && interpDict.function in EasingFunctions ){
				e=EasingFunctions[interpDict.function](p);
			}

			for (var [key, value] of Object.entries(d.params)) {
				var thisVal = undefined;
				if (value.function != undefined && value.function in EasingFunctions ){
					e=EasingFunctions[interpDict.function](p);
				}

				if(typeof d.startVals[value.param] === "number" && !Array.isArray(d.startVals[value.param])){
					thisVal = d.startVals[value.param] * (1 - e) + d.endVals[value.param] * e;
					Max.outlet(["param", value.param, thisVal]);
				}

				else if(Array.isArray(d.startVals[value.param])){
					thisVal = [];
					for (var i=0; i < d.startVals[value.param].length; i++){
						thisVal[i] = Number(d.startVals[value.param][i]) * (1 - e) + Number(d.endVals[value.param][i]) * e;					
					}
					//Max.post(thisVal);
					var outputArray = ["param", value.param];
					for (var i=0 ; i< thisVal.length; i++){
						outputArray.push(thisVal[i]);
					}

					Max.outlet(outputArray);

					}

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
