$(".input_image").click(function (e) {
  $(this).parent().find(".hidden_upload").click();
})

$(".input_image").on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
  e.preventDefault();
  e.stopPropagation();
})

function loadPreviewFromFiles(files) {
  var ReaderObj = new FileReader()
  ReaderObj.readAsDataURL(files[0])
  ReaderObj.onloadend = function() {
    $(".input_caption").hide()
    $(".input_image").removeClass("drop_mode")
    $(".input_image img").attr("src", this.result)
  }
}

$(".input_image").on('drop', function(e) {
  files = e.originalEvent.dataTransfer.files;
  loadPreviewFromFiles(files)
});

$(".hidden_upload").on("change", function() {
  var files = !!this.files ? this.files : []
  if (!files.length || !window.FileReader) {
    return
  }
  if (/^image/.test(files[0].type)) {
    loadPreviewFromFiles(files)
  } else {
    alert("Invalid input")
  }
})

$('body').on('click', '.submit', function(e) {
  var src = $('.input_image img').attr('src');
  src = resizeImage(src)
  ws.send(src, function(e) {
    notifyError(e)
  })
})

$('body').on('click', '.clear', function(e) {
  $(".input_caption").show()
  $(".input_image img").removeAttr("src");
  $(".input_image").addClass("drop_mode")
})
