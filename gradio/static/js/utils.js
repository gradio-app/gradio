String.prototype.format = function() {
  a = this;
  for (k in arguments) {
    a = a.replace("{" + k + "}", arguments[k])
  }
  return a
}

function toDataURL(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var reader = new FileReader();
    reader.onloadend = function() {
      callback(reader.result);
    }
    reader.readAsDataURL(xhr.response);
  };
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
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

function toStringIfObject(input) {
  if (input instanceof Object) {
    return JSON.stringify(input);
  }
  return input;
}

function paintSaliency(data, ctx, width, height) {
  var cell_width = width / data[0].length
  var cell_height = height / data.length
  var r = 0
  data.forEach(function(row) {
    var c = 0
    row.forEach(function(cell) {
      if (cell < 0) {
        var color = [7,47,95];
      } else {
        var color = [112,62,8];
      }
      ctx.fillStyle = colorToString(interpolate(cell, [255,255,255], color));
      ctx.fillRect(c * cell_width, r * cell_height, cell_width, cell_height);
      c++;
    })
    r++;
  })
}

function getObjectFitSize(contains /* true = contain, false = cover */, containerWidth, containerHeight, width, height){
  var doRatio = width / height;
  var cRatio = containerWidth / containerHeight;
  var targetWidth = 0;
  var targetHeight = 0;
  var test = contains ? (doRatio > cRatio) : (doRatio < cRatio);

  if (test) {
      targetWidth = containerWidth;
      targetHeight = targetWidth / doRatio;
  } else {
      targetHeight = containerHeight;
      targetWidth = targetHeight * doRatio;
  }

  return {
      width: targetWidth,
      height: targetHeight,
      x: (containerWidth - targetWidth) / 2,
      y: (containerHeight - targetHeight) / 2
  };
}

// val should be in the range [0.0, 1.0]
// rgb1 and rgb2 should be an array of 3 values each in the range [0, 255]
function interpolate(val, rgb1, rgb2) {
  var rgb = [0,0,0];
  var i;
  for (i = 0; i < 3; i++) {
    rgb[i] = rgb1[i] * (1.0 - val) + rgb2[i] * val;
  }
  return rgb;
}

function colorToString(rgb) {
  return "rgb(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ")";
}

function prettyBytes(bytes) {
  let units = ["B", "KB", "MB", "GB", "PB"];
  let i = 0;
  while (bytes > 1024) {
    bytes /= 1024;
    i++;
  }
  let unit = units[i];
  return bytes.toFixed(1) + " " + unit;
}