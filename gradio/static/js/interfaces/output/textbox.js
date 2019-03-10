ws.onmessage = function (event) {
  loadEnd();
 	$(".output_text").val(event.data);
}

$('body').on('click', '.clear', function(e) {
  $(".output_text").val("");
})
