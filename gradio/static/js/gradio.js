function gradio(config, fn, target, example_file_path) {
  target = $(target);
  target.html(`
    <div class="share hidden">
      Live at <a class="share-link" target="_blank"></a>.
      <button class="share-copy">Copy Link</button>
    </div>
    <h1 class="title"></h1>
    <p class="description"></p>
    <div class="panels">
      <div class="panel input_panel">
        <div class="input_interfaces">
        </div>          
        <div class="panel_buttons">
          <button class="clear panel_button">CLEAR</button>
          <button class="submit panel_button">SUBMIT</button>
        </div>
      </div>
      <div class="panel output_panel">
        <div class="loading hidden">
          <img class="loading_in_progress" src="/static/img/logo_loading.gif">
          <img class="loading_failed" src="/static/img/logo_error.png">
        </div>
        <div class="output_interfaces">
        </div>
        <div class="panel_buttons">
          <button class="interpret inactive panel_button">INTERPRET</button>
          <button class="screenshot panel_button left_panel_button">SCREENSHOT</button>
          <button class="record panel_button right_panel_button">GIF</button>
          <div class="screenshot_logo hidden">
            <img src="/static/img/logo_inline.png">
            <button class='record_stop'>
              <div class='record_square'></div>
            </button>
          </div>
          <div class="flag panel_button inactive">
            FLAG
            <div class="dropcontent"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="interpretation_explained hidden">
      <h4>Interpretation Legend <span class='close_explain'>&#10006;</span></h4>
      <div class='interpretation_legend'>
        <div>&larr; Decreased output score / confidence</div>
        <div>Increased output score / confidence &rarr;</div>
      </div>
      <p>When you click Interpret, you can see how different parts of the input contributed to the final output. The legend above will highlight each of the input components as follows:</p>
      <ul></ul>
    </div>
    <div class="examples hidden">
      <h4>Examples</small></h4>
      <div class="examples_control">
        <div class="examples_control_left">
          <button class="run_examples examples-content">Run All</button>
          <button class="load_prev examples-content">Load Previous <small>CTRL + <span class="backward">&#10140;</span></small></button>
          <button class="load_next examples-content">Load Next <small>CTRL + &#10140;</small></button>
          <button class="order_similar examples-content embedding">Order by Similarity</button>
          <button class="view_embeddings examples-content embedding">View Embeddings</button>
          <button class="update_embeddings embeddings-content hidden">Update Embeddings</button>
          <button class="view_examples embeddings-content hidden">View Examples</button>
        </div>
        <div class="examples_control_right">
          <button class="table_examples">
            <svg width="40" height="24"><rect x="0" y="0" width="40" height="6"></rect><rect x="0" y="9" width="40" height="6"></rect><rect x="0" y="18" width="40" height="6"></rect></svg>
          </button>
          <button class="gallery_examples current">
            <svg width="40" height="24"><rect x="0" y="0" width="18" height="40"></rect><rect x="22" y="0" width="18" height="40"></rect></svg>
          </button>
        </div>
      </div>
      <div class="pages hidden">Page:</div>
      <table class="examples-content">
      </table>
      <div class="plot embeddings-content hidden"><canvas id="canvas" width="400px" height="300px"></canvas></div>
    </div>
    <p class="article"></p>    
    `);
  let io_master = Object.create(io_master_template);
  io_master.fn = fn
  io_master.target = target;
  io_master.config = config;
  io_master.example_file_path = example_file_path;

  let input_to_object_map = {
    "csv" : {},
    "image" : image_input,
    "video" : video_input,
    "sketchpad" : sketchpad_input,
    "textbox" : textbox_input,
    "number" : number_input,
    "webcam" : webcam,
    "microphone" : microphone,
    "radio" : radio,
    "checkbox" : checkbox,
    "checkboxgroup" : checkbox_group,
    "slider" : slider,
    "dropdown" : dropdown,
    "audio" : audio_input,
    "file" : file_input,
    "dataframe" : dataframe_input,
  }
  let output_to_object_map = {
    "csv" : {},
    "image" : image_output,
    "video" : video_output,
    "label" : label_output,
    "keyvalues" : key_values,
    "textbox" : textbox_output,
    "highlightedtext": highlighted_text,
    "audio": audio_output,
    "json": json_output,
    "html": html_output,
    "file" : file_output,
    "dataframe" : dataframe_output,
  }
  let id_to_interface_map = {}
  let embedding_chart;

  function set_interface_id(interface, id) {
    interface.id = id;
    id_to_interface_map[id] = interface;
  }
  if (config["title"]) {
    target.find(".title").text(config["title"]);
  }
  if (config["description"]) {
    target.find(".description").text(config["description"]);
  }
  if (config["article"]) {
    target.find(".article").html(config["article"]);
  }
  if (config["share_url"]) {
    let share_url = config["share_url"];
    target.find(".share").removeClass("hidden");
    target.find(".share-link").text(share_url).attr("href", share_url);
    target.find(".share-copy").click(function() {
      copyToClipboard(share_url);
      target.find(".share-copy").text("Copied!");
    })
  };


  _id = 0;
  let input_interfaces = [];
  let output_interfaces = [];
  for (let i = 0; i < config["input_interfaces"].length; i++) {
    input_interface_data = config["input_interfaces"][i];
    input_interface = Object.create(input_to_object_map[input_interface_data[0]]);
    if (input_interface_data[1]["label"]) {
      target.find(".input_interfaces").append(`
        <div class="panel_header">${input_interface_data[1]["label"]}</strong>
      `);
    }
    target.find(".input_interfaces").append(`
      <div class="input_interface interface" interface_id=${_id}>
        ${input_interface.html}
      </div>
    `);
    input_interface.target = target.find(`.input_interface[interface_id=${_id}]`);
    set_interface_id(input_interface, _id);
    input_interface.io_master = io_master;
    input_interface.init(input_interface_data[1]);
    input_interfaces.push(input_interface);
    _id++;
  }
  for (let i = 0; i < config["output_interfaces"].length; i++) {
    if (i != 0 && i % (config["output_interfaces"].length / config.function_count) == 0) {
      target.find(".output_interfaces").append("<hr>");
    }
    output_interface_data = config["output_interfaces"][i];
    output_interface = Object.create(output_to_object_map[
      output_interface_data[0]]);
    if (output_interface_data[1]["label"]) {
      target.find(".output_interfaces").append(`
        <div class="panel_header">${output_interface_data[1]["label"]}</strong>
      `);
    }
    target.find(".output_interfaces").append(`
      <div class="output_interface interface" interface_id=${_id}>
        ${output_interface.html}
      </div>
    `);
    target.find(".output_interfaces").append(`
      <div class="loading_time" interface="${i}">  </div>
    `);
    output_interface.target = target.find(`.output_interface[interface_id=${_id}]`);
    set_interface_id(output_interface, _id);
    output_interface.io_master = io_master;
    output_interface.init(output_interface_data[1]);
    output_interfaces.push(output_interface);
    _id++;
  }
  io_master.input_interfaces = input_interfaces;
  io_master.output_interfaces = output_interfaces;
  if (config.layout == "unaligned") {
    target.find(".panels").css("align-items", "flex-start");
  } else if (config.layout == "vertical") {
    target.find(".panels").css("flex-direction", "column");
  }
  function clear_all() {
    for (let input_interface of input_interfaces) {
      input_interface.clear();
    }
    for (let output_interface of output_interfaces) {
      output_interface.clear();
    }
    target.find(".loading").addClass("hidden");
    target.find(".loading_time").text("");
    target.find(".output_interfaces").css("opacity", 1);
    target.find(".flag").addClass("inactive");
    target.find(".interpret").addClass("inactive");
    io_master.last_input = null;
    io_master.last_output = null;
  }  
  target.find(".clear").click(clear_all);

  if (!config["allow_embedding"]) {
    target.find(".embedding").hide();
  }
  if (!config["allow_screenshot"]) {
    target.find(".screenshot, .record").hide();
  }
  if (config["allow_flagging"] !== true) {
    target.find(".flag").hide();
  }
  if (!config["allow_interpretation"]) {
    target.find(".interpret").hide();
  } else {
    let interpret_html = ""; 
    for (let [i, interface] of io_master.input_interfaces.entries()) {
      let label = config.input_interfaces[i][1]["label"];
      interpret_html += "<li><strong>" + label + "</strong> - " + interface.interpretation_logic + "</li>";
    }
    target.find(".interpretation_explained ul").html(interpret_html);
    target.find(".interpretation_explained .close_explain").click(function() {
      target.find(".interpretation_explained").remove();
    });
  }
  function load_example(example_id) {
    clear_all();
    if (!(example_id in config["examples"])) {
      return;
    }
    for (let [i, value] of config["examples"][example_id].entries()) {
      if (i < input_interfaces.length) {
        input_interfaces[i].load_example(value);
      } else if (i - input_interfaces.length < output_interfaces.length) {
        let output_interface = output_interfaces[i - input_interfaces.length];
        if ("load_example" in output_interface) {
          output_interface.load_example(value);
        } else {
          output_interface.output(value)
        }
      }
    };
    if (io_master.loaded_examples && example_id in io_master.loaded_examples) {
      io_master.output({"data": io_master.loaded_examples[example_id]});
    }
    let example_order = io_master.order_mapping.indexOf(example_id);
    let current_page = Math.floor(example_order / config["examples_per_page"]);
    if (current_page != io_master.current_page) {
      io_master.current_page = current_page;
      load_page();
    }
    $(".examples_body > tr").removeClass("current_example");
    $(".examples_body > tr[row='" + example_id + "'").addClass("current_example");
    io_master.current_example = example_id;
    window.location.hash = example_id + 1;
  }
  function hash_handler() {
    let hash = window.location.hash;
    if (hash == "") {
      return;
    }
    hash = hash.substring(1)
    if (!isNaN(parseInt(hash))) {
      load_example(parseInt(hash) - 1);
    }
  }
  function next_example() {
    current_example = io_master.current_example;
    if (current_example == null) {
      new_index = 0;
    } else {
      new_index = (io_master.order_mapping.indexOf(current_example) + 1 + config.examples.length) % config.examples.length;
    }
    load_example(io_master.order_mapping[new_index]);
  }
  function prev_example() {
    current_example = io_master.current_example;
    if (current_example == null) {
      new_index = 0;
    } else {
      new_index = (io_master.order_mapping.indexOf(current_example) - 1 + config.examples.length) % config.examples.length;
    }
    load_example(io_master.order_mapping[new_index]);
  }
  function load_page() {
    page_num = io_master.current_page;
    target.find(".page").removeClass("primary");
    target.find(`.page[page=${page_num}]`).addClass("primary");
    let page_start = page_num * config["examples_per_page"]
    let html = "";
    for (let i = page_start; i < page_start + config["examples_per_page"] && i < config.examples.length; i++) {
      let example_id = io_master.order_mapping[i];
      let example = config["examples"][example_id];
      html += "<tr row=" + example_id + ">";
      for (let [j, col] of example.entries()) {
        let new_col = JSON.parse(JSON.stringify(col))
        if (j < input_interfaces.length) {
          if (input_interfaces[j].load_example_preview) {
            new_col = input_interfaces[j].load_example_preview(new_col);
          }
        } else {
          let k = j - input_interfaces.length;
          if (k < output_interfaces.length && output_interfaces[k].load_example_preview) {
            new_col = output_interfaces[k].load_example_preview(new_col);
          }
        }
        html += "<td>" + new_col + "</td>";
      }
      if (io_master.loaded_examples && example_id in io_master.loaded_examples) {
        output_values = io_master.loaded_examples[example_id]
        for (let j = 0; j < output_values.length; j++) {
          let output_interface = io_master.output_interfaces[j];
          let example_preview = output_values[j];
          if (output_interface.load_example_preview) {
            example_preview = output_interface.load_example_preview(example_preview)
          }
          html += "<td>" + example_preview + "</td>";
        }
      }
      html += "</tr>";
    }
    target.find(".examples > table > tbody").html(html);
  }
  if (config["examples"]) {
    target.find(".examples").removeClass("hidden");
    let html = "<thead>"
    for (let input_interface of config["input_interfaces"]) {
      html += "<th>" + input_interface[1]["label"] + "</th>";
    }
    if (config["examples"].length > 0 && config["examples"][0].length > config["input_interfaces"].length) {
      for (let output_interface of config["output_interfaces"]) {
        html += "<th>" + output_interface[1]["label"] + "</th>";
      }
    }
    html += "</thead>";
    html += "<tbody class='examples_body'></tbody>";
    target.find(".examples table").html(html);
    io_master.current_page = 0;
    io_master.order_mapping = [...Array(config.examples.length).keys()];
    let page_count = Math.ceil(config.examples.length / config.examples_per_page)
    if (page_count > 1) {
      target.find(".pages").removeClass("hidden");
      let html = "";
      for (let i = 0; i < page_count; i++) {
        html += `<button class='page' page='${i}'>${i+1}</button>`
      }
      target.find(".pages").append(html);
    }
    load_page();
    window.onhashchange = hash_handler;
    hash_handler();  
    target.on("click", ".examples_body > tr", function() {
      let example_id = parseInt($(this).attr("row"));
      load_example(example_id);
    })
    target.on("click", ".page", function() {
      let page_num = parseInt($(this).attr("page"));
      io_master.current_page = page_num;
      load_page();
    })
    set_table_mode = function() {
      target.find(".examples-content").removeClass("gallery");
      target.find(".examples_control_right button").removeClass("current");
      target.find(".table_examples").addClass("current");
    }
    set_gallery_mode = function() {
      target.find(".examples-content").addClass("gallery");
      target.find(".examples_control_right button").removeClass("current");
      target.find(".gallery_examples").addClass("current");
    }
    target.on("click", ".table_examples",  set_table_mode);
    target.on("click", ".gallery_examples",  set_gallery_mode);
    if (config["examples"].length > 0 && config["examples"][0].length > 1) {
      set_table_mode();
    } else {
      set_gallery_mode();
    }
    target.find(".load_prev").click(prev_example);
    target.find(".load_next").click(next_example);
    target.find(".order_similar").click(function() {
      io_master.score_similarity(function() {
        io_master.current_page = 0
        io_master.current_example = null;
        load_page();  
      })
    });
    target.find(".view_examples").click(function() {
      target.find(".examples-content").removeClass("hidden");        
      target.find(".embeddings-content").addClass("hidden");  
    });
    target.find(".update_embeddings").click(function() {
      io_master.update_embeddings(function(output) {
        embedding_chart.data.datasets[0].data.push(output["sample_embedding_2d"][0]);
        console.log(output["sample_embedding_2d"][0])
        embedding_chart.update();
      })
    });
    target.find(".view_embeddings").click(function() {
      io_master.view_embeddings(function(output) {
        let ctx = $('#canvas')[0].getContext('2d');
        let backgroundColors = getBackgroundColors(io_master);
        embedding_chart = new Chart(ctx, {
          type: 'scatter',
          data: {
              datasets: [{
                label: 'Sample Embedding',
                data: output["sample_embedding_2d"],
                backgroundColor: 'rgb(0, 0, 0)',
                borderColor: 'rgb(0, 0, 0)',
                pointRadius: 13,
                pointHoverRadius: 13,
                pointStyle: 'rectRot',
                showLine: true,
                fill: false,
              }, {
                label: 'Dataset Embeddings',
                data: output["example_embeddings_2d"],
                backgroundColor: backgroundColors,
                borderColor: backgroundColors,
                pointRadius: 7,
                pointHoverRadius: 7
              }]
          },
          options: {
            legend: {display: false}
          }
        });
        $("#canvas")[0].onclick = function(evt){
          var activePoints = embedding_chart.getElementsAtEvent(evt);
          var firstPoint = activePoints[0];
          if (firstPoint._datasetIndex==1) { // if it's from the sample embeddings dataset
            load_example(firstPoint._index)
          }
        };
    
        target.find(".examples-content").addClass("hidden");        
        target.find(".embeddings-content").removeClass("hidden");  
        })
    });
    $("body").keydown(function(e) {
      if ($(document.activeElement).attr("type") == "text" || $(document.activeElement).attr("type") == "textarea") {
        return;
      }
      e = e || window.event;
      var keyCode = e.keyCode || e.which,
          arrow = {left: 37, up: 38, right: 39, down: 40 };    
      if (e.ctrlKey) {
        if (keyCode == arrow.left) {
          prev_example();
        } else if (keyCode == arrow.right) {
          next_example();
        }
      }
    });
  };

  
  target.find(".screenshot").click(function() {
    $(".screenshot, .record").hide();
    $(".screenshot_logo").removeClass("hidden");
    $(".record_stop").hide();
    html2canvas(target[0], {
      scrollX: 0,
      scrollY: -window.scrollY
    }).then(function(canvas) {
      saveAs(canvas.toDataURL(), 'screenshot.png');
      $(".screenshot, .record").show();
      $(".screenshot_logo").addClass("hidden");
    });
  });
  target.find(".record").click(function() {
    $(".screenshot, .record").hide();
    $(".screenshot_logo").removeClass("hidden");
    $(".record_stop").show();
    target.append("<canvas class='recording_draw hidden' width=640 height=480></canvas>");
    target.append("<video class='recording hidden' autoplay playsinline></video>");
    navigator.mediaDevices.getDisplayMedia(
      { video: { width: 9999, height: 9999 } }
    ).then(stream => {
      video = target.find("video.recording")[0];
      canvas = target.find("canvas.recording_draw")[0];
      io_master.recording = {frames: [], stream: stream};
      video.srcObject = stream;
      const ctx = canvas.getContext('2d');
      io_master.recording.interval = window.setInterval(() => {
        let first = (io_master.recording.width === undefined);
        if (first) {
          io_master.recording.width = video.videoWidth;          
          io_master.recording.height = video.videoHeight;          
          io_master.recording.start = Date.now();          
          canvas.width = `${video.videoWidth}`;
          canvas.height = `${video.videoHeight}`;
        }
        ctx.drawImage(video, 0, 0);
        const imageData = ctx.getImageData(0, 0, io_master.recording.width, io_master.recording.height);
        io_master.recording.frames.push({
          imageData,
          timestamp: first ? 0 : Date.now() - this.startTime
        });
      }, 100);
    });
  });
  target.find(".record_stop").click(function() {
    window.clearInterval(io_master.recording.interval);
    io_master.recording.stream.getTracks().forEach(track => track.stop());
    const gif = new GifEncoder({
      width: io_master.recording.width,
      height: io_master.recording.height,
    });

    gif.once('finished', blob => {
      saveAs(URL.createObjectURL(blob), 'recording.gif');
    });

    const start = 0;
    const end = io_master.recording.frames.length - 1;

    const processFrame = index => {
      if (index > end) {
        gif.render();
        return;
      }
      let { imageData, timestamp } = io_master.recording.frames[index];
      const delay = index < end ? io_master.recording.frames[index + 1].timestamp - timestamp : 100;
      gif.addFrame(imageData, delay);
      setTimeout(() => processFrame(index + 1), 0);
    };
    processFrame(start);

    $(".screenshot, .record").show();
    $(".screenshot_logo").addClass("hidden");
    target.find("canvas.recording_draw").remove();
    target.find("video.recording").remove();
  })
  if (config.live) {
    io_master.gather();
  } else {
    target.find(".submit").show();
    target.find(".submit").click(function() {
      io_master.gather();
    })
  }
  if (!config.show_input) {
    target.find(".input_panel").hide();
  }
  function flash_flag() {
    target.find(".flag").addClass("flagged");
    target.find(".dropcontent").addClass("hidden");
    window.setTimeout(() => {
      target.find(".flag").removeClass("flagged");
      target.find(".dropcontent").removeClass("hidden");
    }, 500);

  }
  if (config.allow_flagging) {
    if (config.flagging_options) {
      target.find(".flag").addClass("dropdown");
      for (let option of config.flagging_options) {
        target.find(".dropcontent").append(`<div>${option}</div>`)
      }
      target.find(".flag .dropcontent div").click(function() {
        if (io_master.last_output) {
          target.find(".flag .dropcontent");
          flash_flag();
          io_master.flag($(this).text());
        }
      });
      
    } else {
      target.find(".flag").click(function() {
        if (io_master.last_output) {
          flash_flag();
          io_master.flag();
        }
      });
    }
  }
  if (config.hide_run_all) {
    $(".run_examples").hide();
  }
  target.find(".interpret").click(function() {
    target.find(".interpretation_explained").removeClass("hidden");
    if (io_master.last_output) {
      io_master.interpret();
    }
  });
  target.find(".run_examples").click(function() {
    if (!io_master.has_loaded_examples) {
      this.has_loaded_examples = true;
      let html = ""
      for (let i = 0; i < io_master.output_interfaces.length; i++) {
        html += "<th>" + config.output_interfaces[i][1]["label"] + "</th>";
      }
      target.find(".examples > table > thead > tr").append(html);
    }
    io_master.has_loaded_examples = true;
    io_master.submit_examples(load_page);
})

  $(".input_panel").on("mouseover", ".alternate", function() {
    let interface_index = $(this).closest(".interface").attr("interface_id");
    let alternate_index = $(this).attr("alternate_index");
    io_master.alternative_interpret(interface_index, alternate_index);
  })
  $(".input_panel").on("mouseout", ".alternate", function() {
    io_master.alternative_interpret(false);
  })

  return io_master;
}
function gradio_url(config, url, target, example_file_path) {
  return gradio(config, function(data, action) {
    return new Promise((resolve, reject) => {
      $.ajax({type: "POST",
        url: url + action + "/",
        data: JSON.stringify({"data": data}),
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        success: resolve,
        error: reject,
      });
    });              
  }, target, example_file_path);
}
function saveAs(uri, filename) {
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
