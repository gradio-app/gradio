var cropper;

$('body').on('click', ".input_image.drop_mode", function (e) {
  $(this).parent().find(".hidden_upload").click();
})

$('body').on('drag dragstart dragend dragover dragenter dragleave drop', ".input_image.drop_mode", function(e) {
  e.preventDefault();
  e.stopPropagation();
})

function loadPreviewFromFiles(files) {
  var ReaderObj = new FileReader()
  ReaderObj.readAsDataURL(files[0])
  ReaderObj.onloadend = function() {
    $(".input_caption").hide()
    $(".input_image").removeClass("drop_mode")
    var image = $(".input_image img")
    image.attr("src", this.result)
    image.cropper({aspectRatio : 1.0});
    if (!cropper) {
      cropper = image.data('cropper');
    }
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
  if (cropper) {
    cropper.destroy();
    cropper = null
  }
  $(".input_caption").show()
  $(".input_image img").removeAttr("src");
  $(".input_image").addClass("drop_mode")
})
