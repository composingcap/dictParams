var findArray = [];

function dump(dictName) {
  var d = new Dict(dictName);
  crawl(d, "");

}


function crawl(dict, keyString, mode) {
	if (mode == null) mode="dump";
  var keys = dict.getkeys();
  if (typeof keys === 'string') {
    keys = [keys];
  }
  for (var k = 0; k < keys.length; k++) {
    key = keys[k];
    var type = dict.gettype(key);


    if (type == "dictionary") {
      crawl(dict.get(key), keyString + key + "::");

    } else {
      outArray = []
      outArray.push(keyString + key)

      if (type == "array") {
        var ar = dict.get(key);

        for (var i = 0; i < ar.length; i++) {

          outArray.push(ar[i]);

        }

      } else {
        outArray.push(dict.get(key));
      }


	if (mode="dump"){
		outArray.unshift(mode)
      outlet(0, outArray)
}
	if (mode="find"){
		findArray.push(outArray);
		}
    }


  }



}


function dictJsonParse(dictName) {
  var d = new Dict(dictName);
  d = JSON.parse(d.stringify());

  return d;
}

function jsonDictParse(json, dictName) {

  var d = new Dict(dictName);
  d.parse(JSON.stringify(json));
}


function find(){
	findArray = []
	
	
	
	}