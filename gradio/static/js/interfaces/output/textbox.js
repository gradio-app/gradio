$('body').on('click', '.clear', function(e) {
  $(".output_text").val("");
})
ws.onmessage = function (event) {
 	$(".output_text").val(event.data);
}
