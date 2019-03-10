ws.onmessage = function (event) {
 	$("#textbox-output").val(event.data);
}
