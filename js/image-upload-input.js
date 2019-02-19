Dropzone.options.image_upload_input = {
    autoProcessQueue: false,
};

myDropzone.on('addedfile', function(file) {
        var reader = new FileReader();
        dataURL = reader.readAsDataURL(file);
});


$('#submit-button').on("click", function() { 
   ws.send(dataURL, function(e){
      notifyError(e)
    });
 });
