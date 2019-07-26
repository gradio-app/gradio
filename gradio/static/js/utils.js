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

function toStringIfObject(input) {
  if (input instanceof Object) {
    return JSON.stringify(input);
  }
  return input;
}

function paintSaliency(data, width, height, ctx) {
  var cell_width = width / data[0].length
  var cell_height = height / data.length
  var r = 0
  data.forEach(function(row) {
    var c = 0
    row.forEach(function(cell) {
      if (cell < 0.25) {
        ctx.fillStyle = "white";
      } else if (cell < 0.5) {
        ctx.fillStyle = "#add8ed";
      } else if (cell < 0.75) {
        ctx.fillStyle = "#5aa7d3";
      } else {
        ctx.fillStyle = "#072F5F";
      }
      ctx.fillRect(c * cell_width, r * cell_height, cell_width, cell_height);
      c++;
    })
    r++;
  })
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

// quick helper function to convert the array into something we can use for css
function colorToString(rgb) {
  return "rgb(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ")";
}
