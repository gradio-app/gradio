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
      var data = JSON.parse(event.data)
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



function changeToFlagged() {
  var f = document.getElementsByClassName("flag");
  f[0].style.cssText = 'background-color:pink !important'  ;
  f[0].value="flagged";
}

function sendMessage() {
  var m = document.getElementsByClassName("message");
  m[0].style.cssText = 'background:lightgrey !important' ;
  // m[0].style.cssText = 'display:none' ;
  var s = document.getElementsByClassName("send-message");
  s[0].style.cssText = 'background-color:lightgreen !important'  ;
  s[0].value="Sent!"

  // c[0].value="flagged";
}
