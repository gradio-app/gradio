var predict_div = $("#predict_div").val();

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
    console.log(event.data);
    sleep(300).then(() => {
      $("#predict_div").text(event.data);
      $("#predict_div").css("font-family", "Arial");
      $("#predict_div").css("color", "White");
      $("#predict_div").css("font-size", "20vw");
      $("#predict_div").css("text-align", "center");
      $("#predict_div").css("vertical-align", "middle");
    })

  }
} catch (e) {
  notifyError(e)
}
