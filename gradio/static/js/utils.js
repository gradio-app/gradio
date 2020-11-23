String.prototype.format = function() {
  a = this;
  for (k in arguments) {
    a = a.replace("{" + k + "}", arguments[k])
  }
  return a
}

function sortWithIndices(toSort) {
  for (var i = 0; i < toSort.length; i++) {
    toSort[i] = [toSort[i], i];
  }
  toSort.sort(function(left, right) {
    return left[0] < right[0] ? -1 : 1;
  });
  toSort.sortIndices = [];
  for (var j = 0; j < toSort.length; j++) {
    toSort.sortIndices.push(toSort[j][1]);
    toSort[j] = toSort[j][0];
  }
  return toSort.sortIndices;
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
      ctx.fillStyle = getSaliencyColor(cell);
      ctx.fillRect(c * cell_width, r * cell_height, cell_width, cell_height);
      c++;
    })
    r++;
  })
}

function getBackgroundColors(io_master){
  //Gets the background colors for the embedding plot

  // If labels aren't loaded, or it's not a label output interface:
  if (!io_master.loaded_examples || io_master["config"]["output_interfaces"][0][0]!="label") {
    return 'rgb(54, 162, 235)'
  }

  // If it is a label interface, get the labels
  let labels = []
  let isConfidencesPresent = false;
  for (let i=0; i<Object.keys(io_master.loaded_examples).length; i++) {
    let label = io_master.loaded_examples[i][0]["label"];
    if ("confidences" in io_master.loaded_examples[i][0]){
      isConfidencesPresent = true;
    }
    labels.push(label);
  }
  
  // If they are all numbers, and there are no confidences, then it's a regression
  const isNumeric = (currentValue) => !isNaN(currentValue);
  let isNumericArray = labels.every(isNumeric);
  if (isNumericArray && !isConfidencesPresent) {
    let backgroundColors = [];
    labels = labels.map(Number);
    let max = Math.max(...labels);
    let min = Math.min(...labels);
    let rgb_max = [255, 178, 102]
    let rgb_min = [204, 255, 255]
    for (let i=0; i<labels.length; i++) {
      let frac = (Number(labels[i])-min)/(max-min)
      let color = [rgb_min[0]+frac*(rgb_max[0]-rgb_min[0]),
                   rgb_min[1]+frac*(rgb_max[1]-rgb_min[1]),
                   rgb_min[2]+frac*(rgb_max[2]-rgb_min[2])]
      backgroundColors.push(color);
    }
  }
  
  // Otherwise, it's a classification
  let colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#00B3E6', 
                    '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
                    '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
                    '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
                    '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
                    '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
                    '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
                    '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
                    '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
                    '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];
  let backgroundColors = [];
  let label_list = [];
  for (let i=0; i<labels.length; i++) {
    if (!(label_list.includes(labels[i]))){
      label_list.push(labels[i]);
    }
  backgroundColors.push(colorArray[label_list.indexOf(labels[i]) % colorArray.length]);
  }
  return backgroundColors
}


function getSaliencyColor(value) {
  if (value < 0) {
    var color = [52, 152, 219];
  } else {
    var color = [231, 76, 60];
  }
  return colorToString(interpolate(Math.abs(value), [255,255,255], color));
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
  if (val > 1) {
    val = 1;
  }
  val = Math.sqrt(val);
  var rgb = [0,0,0];
  var i;
  for (i = 0; i < 3; i++) {
    rgb[i] = Math.round(rgb1[i] * (1.0 - val) + rgb2[i] * val);
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