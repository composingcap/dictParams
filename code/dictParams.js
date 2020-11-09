function dump(dictName) {
  var d = new Dict(dictName);
  dump_address(d, "");

}


function dump_address(dict, keyString) {
  var keys = dict.getkeys();
  if (typeof keys === 'string') {
    keys = [keys];
  }
  for (var k = 0; k < keys.length; k++) {
    key = keys[k];
    var type = dict.gettype(key);


    if (type == "dictionary") {
      dump_address(dict.get(key), keyString + key + "::");

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

      outlet(0, outArray)
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