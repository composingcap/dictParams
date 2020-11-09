const Max = require('max-api');
var targetDictId;
var outputMode = 0;
Max.addHandler("target", (dictID) => {
  targetDictId = arg1
});

Max.addHandeler("eventDict", (dictID) => {
  var eventDict = Max.getDict(dictID);
});

Max.addHandeler("eventMessage", (time, curve, ...args) => {

});