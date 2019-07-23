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
        ctx.fillStyle = "yellow";
      } else if (cell < 0.75) {
        ctx.fillStyle = "orange";
      } else {
        ctx.fillStyle = "red";
      }
      ctx.fillRect(c * cell_width, r * cell_height, cell_width, cell_height);
      c++;
    })
    r++;
  })
}
