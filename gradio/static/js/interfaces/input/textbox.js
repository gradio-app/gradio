var text = $("#textbox-input").val();

$('#clear-button').click(function(e){
    $("textbox-input").text("");
})

$('#submit-button').click(function(e){
    var text = $("#textbox-input").val();
    ws.send(text, function(e){
      notifyError(e)
    });

})
