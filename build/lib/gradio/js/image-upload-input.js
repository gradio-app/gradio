// function previewFile(){
//    var preview = document.querySelector('img'); //selects the query named img
//    var file    = document.querySelector('input[type=file]').files[0]; //sames as here
//    var reader  = new FileReader();

//    reader.onloadend = function () {
//        preview.src = reader.result;
//    }

//    if (file) {
//        reader.readAsDataURL(file); //reads the data as a URL
//        console.log(file)
//    } else {
//        preview.src = "";
//    }
// }

// previewFile();  //calls the function named previewFile()

// $('#submit-button').click(function(e){
//    var file    = document.querySelector('input[type=file]').files[0]; //sames as here
//    var reader  = new FileReader();
//    var preview = document.querySelector('img'); //selects the query named img

//    if (file) {
//         reader.readAsDataURL(file); //reads the data as a URL
//         console.log(preview.src)
//         ws.send(preview.src, function(e){
//       notifyError(e)
//     });
// }
// })


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

    // var reader = new FileReader();
    // reader.readAsDataURL(e.target.files[0]);
    var src = $('.uploader img').attr('src');
    ws.send(src, function(e){
      notifyError(e)
    });
})
