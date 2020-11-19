var socket = io();
var editor;

socket.on("loadJSON", (data) => {

  const container = document.getElementById("jsoneditor")
  const options = {
    onChangeJSON: function(json) {
      socket.emit("edit", json);
    },
    onEvent: function(node, event) {
      if (event.type === 'click') {
        let message = [];
        message.push(prettyPrintPath(node.path))
        if (node.value) {
          message.push(node.value)
        } else {
          message.push(node.value)
        }
        socket.emit("clicked", message);

      }
    }
  }
  if (editor == undefined) {
    editor = new JSONEditor(container, options);
    editor.set(data)
  } else {
    editor.update(data)
  }

  // get json
  const updatedJson = editor.get()
});

socket.on("setName", (data) => {
  document.getElementById("dictName").innerHTML = data;
  document.getElementById("titlebar").innerHTML = data;

});


function saveConfig() {
  var JSON = editor.get()
  socket.emit("saveJSON", JSON);
}

function prettyPrintPath(path) {
  let str = '';
  for (let i = 0; i < path.length; i++) {
    const element = path[i];
    if (typeof element === 'number') {
      str += element;
    } else {
      if (str.length > 0) str += '::';
      str += element;
    }
  }
  return str
}