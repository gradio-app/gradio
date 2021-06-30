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
    if (value < 0) {
        var color = [52, 152, 219];
    } else {
        var color = [231, 76, 60];
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

export function getObjectFitSize(contains /* true = contain, false = cover */, containerWidth, containerHeight, width, height) {
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

export function paintSaliency(data, ctx, width, height) {
    var cell_width = width / data[0].length
    var cell_height = height / data.length
    var r = 0
    data.forEach(function (row) {
        var c = 0
        row.forEach(function (cell) {
            ctx.fillStyle = getSaliencyColor(cell);
            ctx.fillRect(c * cell_width, r * cell_height, cell_width, cell_height);
            c++;
        })
        r++;
    })
}

export function saveAs(uri, filename) {
    var link = document.createElement('a');
    if (typeof link.download === 'string') {
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