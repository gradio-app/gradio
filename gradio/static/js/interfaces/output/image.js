ws.onmessage = function (event) {
  loadEnd();
  $(".output_image img").attr("src", event.data);
  $(".output_image img").show();
}

$('body').on('click', '.clear', function(e) {
  $(".output_image img").removeAttr("src");
  $(".output_image img").hide();
})
