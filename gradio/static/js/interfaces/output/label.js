ws.onmessage = function (event) {
  loadEnd();
  var output = JSON.parse(event.data)
  // data = {
  //   label: "happy",
  //   confidences : [
  //    {
  //     label : "happy",
  //     confidence: 0.7
  //    },
  //    {
  //     label : "sad",
  //     confidence: 0.3
  //    },
  //   ]
  //   }
  if (output['action'] == 'output') {
    data = JSON.parse(output['data']);
    $(".output_class").text(data["label"])
    $(".confidence_intervals").empty()
    if (data.confidences) {
      data["confidences"].forEach(function (c) {
        var confidence = c["confidence"]
        $(".confidence_intervals").append(`<div class="confidence"><div class=
            "label">${c["label"]}</div><div class="level" style="flex-grow:
              ${confidence}">${Math.round(confidence * 100)}%</div></div>`)
      })
    }
  }
}

$('body').on('click', '.clear', function(e) {
  $(".output_class").text("")
  $(".confidence_intervals").empty()
})

// $('body').on('click', '.flag', function(e) {
//   src = cropper.getCroppedCanvas({
//     maxWidth: 360,
//     maxHeight: 360,
//     fillColor: "white"
//   }).toDataURL();
//   ws.send(src, function(e) {
//     notifyError(e)
//   })
// })
