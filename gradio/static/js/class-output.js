function notifyError(error) {
      $.notify({
          // options
          message: 'Not able to communicate with model (is python code still running?)'
      },{
          // settings
          type: 'danger',
          animate: {
              enter: 'animated fadeInDown',
              exit: 'animated fadeOutUp'
          },
          placement: {
              from: "bottom",
              align: "right"
          },
          delay: 5000

      });
 }

try {
  ws.onerror = function(evt) {
    notifyError(evt)
  };

  ws.onmessage = function (event) {
    sleep(300).then(() => {
//      $(".output_class").text(event.data);
      var data = event.data
      $(".output_class").text(data["label"])
      $(".confidence_intervals").empty()
      if ("confidences" in data) {
        data["confidences"].forEach(function (c) {
          var confidence = c["confidence"]
          $(".confidence_intervals").append(`<div class="confidence"><div class=
              "label">${c["label"]}</div><div class="level" style="flex-grow:
                ${confidence}">${Math.round(confidence * 100)}%</div></div>`)
        })
      }
    })

  }
} catch (e) {
  notifyError(e)
}

$('body').on('click', '.clear', function(e) {
  $(".output_class").text("")
  $(".confidence_intervals").empty()
})
