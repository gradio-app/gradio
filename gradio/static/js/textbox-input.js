var text = $("#textbox-input").val();



$('#clear-button').click(function(e){
    document.getElementById("textbox-input").value="";
})


$('#submit-button').click(function(e){
    // var dataURL = canvas.toDataURL("image/png");
    var text = $("#textbox-input").val();
    console.log(text);
    ws.send(text, function(e){
      notifyError(e)
    });

})
