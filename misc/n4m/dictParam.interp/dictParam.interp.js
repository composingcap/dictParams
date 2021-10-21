const Max = require('max-api');

var paramDictName = "";
var duration = 5000;
var grain = 20;
var lastTime = 0;
var lerperOn = 0;

var interpDicts = [];
var removeDicts = []

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);


Max.addHandler("interp", (dname) =>{
	
		Max.getDict(dname).then((dataInterp) => {
			
			interpDict = dataInterp;	
			

			
			Max.getDict(paramDictName).then((dataDict) =>{
		
		interpDict.startTime = process.hrtime()[1]/1000000;
		interpDict.currentTime = 0;
		interpDict.targets = [];
		interpDict.endVals = {};
		interpDict.startVals = {};
		
			for (var [key, value] of Object.entries(interpDict.preset.params)){
				Max.outlet("param", value.param, value.value);
					var datakey = value.param.split(/[\/,\.,\(::\)]+/);
					var datastring = "dataDict"
					for (var l of datakey){
						datastring += "[\""+l+"\"]";
					}
					eval(datastring + "= " + value.value);
					
				}
				if (interpDict.preset.message != undefined){ 
					Max.outlet(["message",interpDict.preset.message]); 
				}
			
		
		
		for (var [key, value] of Object.entries(interpDict.params)){
				var datakey = value.param.split(/[\/,\.,\(::\)]+/);
				var datastring = "dataDict"
				for (var l of datakey){
					datastring += "[\""+l+"\"]";
					}
				interpDict.startVals[value.param] = eval(datastring);
				interpDict.endVals[value.param] = value.value;		
				
					}
						
		interpDicts.push(interpDict);
		
		
		if (!lerperOn){ 
			lerperOn = 1;
			lastTime = interpDict.startTime;
			setTimeout(timerLoop,0);
		}})});
	
	});
	
Max.addHandler("dictName", (dname)=>{
	paramDictName = dname;
	});
	
	

function timerLoop(){
	
	
	var thisTime = process.hrtime()[1]/1000000;
	var deltaTime = Math.abs(thisTime - lastTime);
	lastTime = thisTime;
	

	
	removeDicts = [];
	
	for (var i = 0; i < interpDicts.length; i++){
		
		d = interpDicts[i];
		
		if (d.currentTime >= (d.duration+d.delay)){
			removeDicts.push(i)
			if (d.callback != undefined){
			Max.outlet(["callback", d.callback]);
			}
			
			continue
			}
		

		
		
		d.currentTime += deltaTime;
		if (d.currentTime < d.delay) continue;
		
			for (var [key, value] of Object.entries(d.params)){
				var p = d.currentTime/d.duration;
				p = clamp(p,0,1);
				var thisVal = d.startVals[value.param]*(1-p)+d.endVals[value.param]*p;
				Max.outlet(["param", value.param, thisVal]);
				
			
			}
		
		}
		
		for (var i = 0; i < removeDicts.length; i++){
			
			interpDicts.splice(removeDicts[i])
			}
	
	
	if (interpDicts.length > 0){
		setTimeout(timerLoop, grain);
	}
	else {
		lerperOn = 0;
		Max.post("done");
		}
	
	
	
	
	}