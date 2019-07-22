String.prototype.format = function() {
  a = this;
  for (k in arguments) {
    a = a.replace("{" + k + "}", arguments[k])
  }
  return a
}

function resizeImage(base64Str, max_width, max_height, callback) {
  var img = new Image();
  img.src = base64Str;
  var canvas = document.createElement('canvas');
  img.onload = () => {
    var width = img.width;
    var height = img.height;

    if (width > height) {
      if (width > max_width) {
        height *= max_width / width;
        width = max_width;
      }
    } else {
      if (height > max_height) {
        width *= max_height / height;
        height = max_height;
      }
    }
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    callback.call(null, canvas.toDataURL());
  }
}
