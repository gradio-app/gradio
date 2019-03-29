function loadData(data) {
  console.log("heyyy")
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
  $(".output_class").text(data["label"])
  $(".confidence_intervals").empty()
  if ("confidences" in data) {
    data["confidences"].forEach(function (c) {
      var confidence = c["confidence"]
      $(".confidence_intervals").append(`<div class="confidence"><div class=
          "label" title="${c["label"]}">${c["label"]}</div><div class="level" style="flex-grow:
            ${confidence}">${Math.round(confidence * 100)}%</div></div>`)
    })
  }
}

$('body').on('click', '.clear', function(e) {
  $(".output_class").text("")
  $(".confidence_intervals").empty()
})
