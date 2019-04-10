var cropper;
var aspectRatio = "{{aspect_ratio}}"

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
    image.cropper({
      aspectRatio : aspectRatio,
      background: false
    });
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

$('body').on('click', '.clear', function(e) {
  if (cropper) {
    cropper.destroy();
    cropper = null
    $(".input_image img").remove()
    $(".input_image").append("<img>")
  }
  $(".hidden_upload").prop("value", "")
  $(".input_caption").show()
  $(".input_image img").removeAttr("src");
  $(".input_image").addClass("drop_mode")
})
$('body').on('click', '.submit', function(e) {
  loadStart();
  src = cropper.getCroppedCanvas({
    maxWidth: 360,
    maxHeight: 360,
    fillColor: "white"
  }).toDataURL();
var ws_data = {
    'action': 'input',
    'data': src
  }

  ws.send(JSON.stringify(ws_data), function(e) {
    notifyError(e)
  })
})
