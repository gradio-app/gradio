<script src="https://unpkg.com/ml5@0.1.3/dist/ml5.min.js"></script>


// Takes in the ID of the image, and returns labels and confidences
function imageupload_label(image){
  var output;
  classifier = ml5.imageClassifier('MobileNet', function() {
    console.log('Model Loaded!');
  });
  classifier.predict(image, function(err, results) {
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
  });
  return output
}

// Takes in the ID of the image, and returns labels and confidences
function sketchpad_label(image){
  var output;
  classifier = ml5.imageClassifier('MobileNet', function() {
    console.log('Model Loaded!');
  });
  classifier.predict(image, function(err, results) {
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
  });
  return output
}
