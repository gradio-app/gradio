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
      if (event.data.length == 1) {
        $(".output_class").css({ 'font-size':'300px'});
      }
      $(".output_class").text(event.data);
    })

  }
} catch (e) {
  notifyError(e)
}

