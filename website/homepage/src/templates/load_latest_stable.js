function load_gradio(FILE_URL) {
    console.log(FILE_URL);
    var len = Array.from(document.querySelectorAll('script')).filter(e => e.getAttribute('src') == FILE_URL).length;
    if (len === 0) {
      let scriptEle = document.createElement("script");
      scriptEle.setAttribute("src", FILE_URL);
      scriptEle.setAttribute("type", "module");
      document.body.appendChild(scriptEle);
    }
  }

  {% set gradio_js = 'https://gradio.s3-us-west-2.amazonaws.com/' + latest_gradio_stable + '/gradio.js' %}

  load_gradio("{{ gradio_js }}");