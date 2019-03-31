classifier = ml5.imageClassifier('MobileNet', function() {
  console.log('Model Loaded!');
});

// Takes in the ID of the image, and returns labels and confidences
function upload() {
  classifier.predict(document.getElementById('invisible_img'), function(err,
      results) {
    if (!results) {
      return
    }
    console.log(results)
    var output = {
    'label': results[0].className,
    'confidences': [
        {'label': results[0].className,
        'confidence': results[0].probability.toFixed(4)},
        {'label': results[1].className,
        'confidence': results[1].probability.toFixed(4)},
        {'label': results[2].className,
        'confidence': results[2].probability.toFixed(4)},
      ]
    }
    loadData(output);
  });
}
