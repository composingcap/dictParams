function dump(dictName){
	var d = new Dict(dictName);
	dump_address(d, "");
	
	}
	
	
function dump_address(dict, keyString){
	var keys = dict.getkeys();
	
	for(var k = 0; k < keys.length; k++){
		key = keys[k];
		var type = dict.gettype(key);
		
		if (type == "dictionary"){
			dump_address(dict.get(key), keyString + key + "::");
			
			}
			
		else{
			outlet(0,[keyString + key, dict.get(key)])
			}
		
		
		}
	
	
	
	}