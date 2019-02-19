
var imageLoader = document.getElementById('filePhoto');
    imageLoader.addEventListener('change', handleImage, false);

function handleImage(e) {
    var reader = new FileReader();
    reader.onload = function (event) {
        
        $('.uploader img').attr('src',event.target.result);
    }
    reader.readAsDataURL(e.target.files[0]);
}

$('#submit-button').click(function(e){
    var src = $('.uploader img').attr('src');
    ws.send(src, function(e){
      notifyError(e)
    });
})
