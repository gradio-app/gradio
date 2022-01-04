var mime = require("mime-types");

export function prettyBytes(bytes) {
  let units = ["B", "KB", "MB", "GB", "PB"];
  let i = 0;
  while (bytes > 1024) {
    bytes /= 1024;
    i++;
  }
  let unit = units[i];
  return bytes.toFixed(1) + " " + unit;
}

export function getSaliencyColor(value) {
  var color = null;
  if (value < 0) {
    color = [52, 152, 219];
  } else {
    color = [231, 76, 60];
  }
  return colorToString(interpolate(Math.abs(value), [255, 255, 255], color));
}

function interpolate(val, rgb1, rgb2) {
  if (val > 1) {
    val = 1;
  }
  val = Math.sqrt(val);
  var rgb = [0, 0, 0];
  var i;
  for (i = 0; i < 3; i++) {
    rgb[i] = Math.round(rgb1[i] * (1.0 - val) + rgb2[i] * val);
  }
  return rgb;
}

function colorToString(rgb) {
  return "rgb(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ")";
}

export function getObjectFitSize(
  contains /* true = contain, false = cover */,
  containerWidth,
  containerHeight,
  width,
  height
) {
  var doRatio = width / height;
  var cRatio = containerWidth / containerHeight;
  var targetWidth = 0;
  var targetHeight = 0;
  var test = contains ? doRatio > cRatio : doRatio < cRatio;

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

export function paintSaliency(data, ctx, width, height) {
  var cell_width = width / data[0].length;
  var cell_height = height / data.length;
  var r = 0;
  data.forEach(function (row) {
    var c = 0;
    row.forEach(function (cell) {
      ctx.fillStyle = getSaliencyColor(cell);
      ctx.fillRect(c * cell_width, r * cell_height, cell_width, cell_height);
      c++;
    });
    r++;
  });
}

export function saveAs(uri, filename) {
  var link = document.createElement("a");
  if (typeof link.download === "string") {
    link.href = uri;
    link.download = filename;
    //Firefox requires the link to be in the body
    document.body.appendChild(link);
    //simulate click
    link.click();
    //remove the link when done
    document.body.removeChild(link);
  } else {
    window.open(uri);
  }
}

export function array_compare(a1, a2) {
  if (a1.length != a2.length) {
    return false;
  }
  for (var i in a1) {
    // Don't forget to check for arrays in our arrays.
    if (a1[i] instanceof Array && a2[i] instanceof Array) {
      if (!array_compare(a1[i], a2[i])) {
        return false;
      }
    } else if (a1[i] != a2[i]) {
      return false;
    }
  }
  return true;
}

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function isNumeric(str) {
  if (typeof str != "string") return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
}

export function CSVToArray(strData, strDelimiter) {
  strDelimiter = strDelimiter || ",";
  let objPattern = new RegExp(
    "(\\" +
      strDelimiter +
      "|\\r?\\n|\\r|^)" +
      '(?:"([^"]*(?:""[^"]*)*)"|' +
      '([^"\\' +
      strDelimiter +
      "\\r\\n]*))",
    "gi"
  );
  let arrData = [[]];
  let arrMatches = null;
  while ((arrMatches = objPattern.exec(strData))) {
    let strMatchedDelimiter = arrMatches[1];
    let strMatchedValue = [];
    if (strMatchedDelimiter.length && strMatchedDelimiter != strDelimiter) {
      arrData.push([]);
    }
    if (arrMatches[2]) {
      strMatchedValue = arrMatches[2].replace(new RegExp('""', "g"), '"');
    } else {
      strMatchedValue = arrMatches[3];
    }
    arrData[arrData.length - 1].push(strMatchedValue);
  }
  for (let i = 0; i < arrData.length; i++) {
    for (let j = 0; j < arrData[i].length; j++) {
      if (isNumeric(arrData[i][j])) {
        arrData[i][j] = parseFloat(arrData[i][j]);
      }
    }
  }
  return arrData;
}

export function isPlayable(data_type, file_name) {
  if (data_type == "audio") {
    let audio_element = new Audio();
    let mime_type = mime.lookup(file_name);
    return audio_element.canPlayType(mime_type) != "";
  } else {
    let video_element = document.createElement("video");
    let mime_type = mime.lookup(file_name);
    return video_element.canPlayType(mime_type) != "";
  }
}

export function getNextColor(index, alpha) {
  alpha = alpha || 1;
  let default_colors = [
    [255, 99, 132],
    [54, 162, 235],
    [240, 176, 26],
    [153, 102, 255],
    [75, 192, 192],
    [255, 159, 64]
  ];
  if (index < default_colors.length) {
    var color_set = default_colors[index];
  } else {
    var color_set = [randInt(64, 196), randInt(64, 196), randInt(64, 196)];
  }
  return (
    "rgba(" +
    color_set[0] +
    ", " +
    color_set[1] +
    ", " +
    color_set[2] +
    ", " +
    alpha +
    ")"
  );
}
