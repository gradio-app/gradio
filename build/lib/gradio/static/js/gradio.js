function gradio(config, fn, target, example_file_path) {
  target = $(target);
  target.html(`
    <div class="share invisible">
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
          <input class="clear panel_button" type="reset" value="CLEAR">
          <input class="submit panel_button" type="submit" value="SUBMIT"/>
        </div>
      </div>
      <div class="panel output_panel">
        <div class="loading invisible">
          <img class="loading_in_progress" src="/static/img/logo_loading.gif">
          <img class="loading_failed" src="/static/img/logo_error.png">
        </div>
        <div class="output_interfaces">
        </div>
        <div class="panel_buttons">
          <input class="interpret panel_button" type="button" value="INTERPRET"/>
          <input class="screenshot panel_button left_panel_button" type="button" value="SCREENSHOT"/>
          <input class="record panel_button right_panel_button" type="button" value="GIF"/>
          <div class="screenshot_logo invisible">
            <img src="/static/img/logo_inline.png">
            <button class='record_stop'>
              <div class='record_square' style=''></div>
            </button>
          </div>
          <input class="flag panel_button" type="button" value="FLAG"/>
        </div>
      </div>
    </div>
    <div class="interpretation_explained invisible">
      <h4>Interpretation Legend <span class='close_explain'>&#10006;</span></h4>
      <div class='interpretation_legend'>
        <div>&larr; Decreased output score / confidence</div>
        <div>Increased output score / confidence &rarr;</div>
      </div>
      <p>When you click Interpret, you can see how different parts of the input contributed to the final output. The legend above will highlight each of the input components as follows:</p>
      <ul></ul>
    </div>
    <div class="examples invisible">
      <h4>Examples</small></h4>
      <button class="run_examples">Run All</button>
      <button class="load_prev">Load Previous <em>(CTRL + &larr;)</em></button>
      <button class="load_next">Load Next <em>(CTRL + &rarr;)</em></button>
      <button class="order_similar">Order by Similarity</button>
      <button class="view_embeddings">Plot Embeddings</button>
      <div class="pages invisible">Page:</div>
      <table>
      </table>
    </div>`);
  let io_master = Object.create(io_master_template);
  io_master.fn = fn
  io_master.target = target;
  io_master.config = config;
  io_master.example_file_path = example_file_path;

  let input_to_object_map = {
    "csv" : {},
    "image" : image_input,
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
  if (config["share_url"]) {
    let share_url = config["share_url"];
    target.find(".share").removeClass("invisible");
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
  target.find(".clear").click(function() {
    for (let input_interface of input_interfaces) {
      input_interface.clear();
    }
    for (let output_interface of output_interfaces) {
      output_interface.clear();
    }
    target.find(".flag").removeClass("flagged");
    target.find(".flag").val("FLAG");
    target.find(".flag_message").empty();
    target.find(".loading").addClass("invisible");
    target.find(".loading_time").text("");
    target.find(".output_interfaces").css("opacity", 1);
    io_master.last_input = null;
    io_master.last_output = null;
  });

  if (!config["allow_screenshot"] && !config["allow_flagging"] && !config["allow_interpretation"]) {
    target.find(".screenshot, .record, .flag, .interpret").css("visibility", "hidden");
  } else {
    if (!config["allow_screenshot"]) {
      target.find(".screenshot, .record").hide();
    }
    if (!config["allow_flagging"]) {
      target.find(".flag").hide();
    }
    if (!config["allow_interpretation"]) {
      target.find(".interpret").hide();
    } else {
      let interpret_html = ""; 
      for (let [i, interface] of io_master.input_interfaces.entries()) {
        let label = config.input_interfaces[i][1]["label"];;
        interpret_html += "<li><strong>" + label + "</strong> - " + interface.interpretation_logic + "</li>";
      }
      target.find(".interpretation_explained ul").html(interpret_html);
      target.find(".interpretation_explained .close_explain").click(function() {
        target.find(".interpretation_explained").remove();
      });
      if (config["examples"]) {
        target.find(".examples").removeClass("invisible");
        let html = "<thead>"
        for (let i = 0; i < config["input_interfaces"].length; i++) {
          label = config["input_interfaces"][i][1]["label"];
          html += "<th>" + label + "</th>";
        }
      }
    }
  }
  function load_example(example_id) {
    for (let [i, value] of config["examples"][example_id].entries()) {
      input_interfaces[i].load_example(value);
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
      console.log(example_id)
      let example = config["examples"][example_id];
      html += "<tr row=" + example_id + ">";
      for (let [j, col] of example.entries()) {
        let new_col = JSON.parse(JSON.stringify(col))
        if (input_interfaces[j].load_example_preview) {
          new_col = input_interfaces[j].load_example_preview(new_col);
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
    target.find(".examples").removeClass("invisible");
    let html = "<thead>"
    for (let i = 0; i < config["input_interfaces"].length; i++) {
      label = config["input_interfaces"][i][1]["label"];
      html += "<th>" + label + "</th>";
    }
    html += "</thead>";
    html += "<tbody class='examples_body'></tbody>";
    target.find(".examples table").html(html);
    io_master.current_page = 0;
    io_master.order_mapping = [...Array(config.examples.length).keys()];
    let page_count = Math.ceil(config.examples.length / config.examples_per_page)
    if (page_count > 1) {
      target.find(".pages").removeClass("invisible");
      let html = "";
      for (let i = 0; i < page_count; i++) {
        html += `<button class='page' page='${i}'>${i+1}</button>`
      }
      target.find(".pages").append(html);
    }
    load_page();
    target.on("click", ".examples_body > tr", function() {
      let example_id = parseInt($(this).attr("row"));
      load_example(example_id);
    })
    target.on("click", ".page", function() {
      let page_num = parseInt($(this).attr("page"));
      io_master.current_page = page_num;
      load_page();
    })
    target.find(".load_prev").click(prev_example);
    target.find(".load_next").click(next_example);
    target.find(".order_similar").click(function() {
      io_master.score_similarity(function() {
        io_master.current_page = 0
        io_master.current_example = null;
        load_page();  
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
  });

  target.find(".screenshot").click(function() {
    $(".screenshot, .record").hide();
    $(".screenshot_logo").removeClass("invisible");
    $(".record_stop").hide();
    html2canvas(target[0], {
      scrollX: 0,
      scrollY: -window.scrollY
    }).then(function(canvas) {
      saveAs(canvas.toDataURL(), 'screenshot.png');
      $(".screenshot, .record").show();
      $(".screenshot_logo").addClass("invisible");
    });
  });
  target.find(".record").click(function() {
    $(".screenshot, .record").hide();
    $(".screenshot_logo").removeClass("invisible");
    $(".record_stop").show();
    target.append("<canvas class='recording_draw invisible' width=640 height=480></canvas>");
    target.append("<video class='recording invisible' autoplay playsinline></video>");
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
    $(".screenshot_logo").addClass("invisible");
    target.find("canvas.recording_draw").remove();
    target.find("video.recording").remove();
  })
  if (config.live) {
    io_master.gather();
  } else {
    target.find(".submit").show();
    target.find(".submit").click(function() {
      io_master.gather();
      target.find(".flag").removeClass("flagged");
      target.find(".flag").val("FLAG");
    })
  }
  if (!config.show_input) {
    target.find(".input_panel").hide();
  }

  target.find(".flag").click(function() {
    if (io_master.last_output) {
      target.find(".flag").addClass("flagged");
      target.find(".flag").val("FLAGGED");
      io_master.flag();
    }
  })
  target.find(".interpret").click(function() {
    target.find(".interpretation_explained").removeClass("invisible");
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
