function gradio(config, fn, target) {
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
          <input class="screenshot panel_button" type="button" value="SCREENSHOT"/>
          <div class="screenshot_logo">
            <img src="/static/img/logo_inline.png">
          </div>
          <input class="flag panel_button" type="button" value="FLAG"/>
        </div>
      </div>
    </div>
    <div class="examples invisible">
      <h3>Examples <small>(click to load)</small></h3>
      <table>
      </table>
    </div>
`);
    let io_master = Object.create(io_master_template);
    io_master.fn = fn
    io_master.target = target;
    io_master.config = config;

    let input_to_object_map = {
      "csv" : {},
      "image" : image_input,
      "sketchpad" : sketchpad_input,
      "textbox" : textbox_input,
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

    if (config["allow_screenshot"] && !config["allow_flagging"]) {
      target.find(".screenshot").css("visibility", "visible");
      target.find(".flag").css("display", "none")
    }
    if (!config["allow_screenshot"] && config["allow_flagging"]) {
      target.find(".flag").css("visibility", "visible");
      target.find(".screenshot").css("display", "none")
    }
    if (config["allow_screenshot"] && config["allow_flagging"]) {
      target.find(".screenshot").css("visibility", "visible");
      target.find(".flag").css("visibility", "visible")
    }
    if (config["examples"]) {
      target.find(".examples").removeClass("invisible");
      let html = "<thead>"
      for (let i = 0; i < config["input_interfaces"].length; i++) {
        label = config["input_interfaces"][i][1]["label"];
        html += "<th>" + label + "</th>";
      }
      html += "</thead>";
      html += "<tbody>";
      for (let [i, example] of config["examples"].entries()) {
        html += "<tr row="+i+">";
        for (let [j, col] of example.entries()) {
          if (input_interfaces[j].load_example_preview) {
            col = input_interfaces[j].load_example_preview(col);
          }
          html += "<td>" + col + "</td>";
        }
        html += "</tr>";
      }
      html += "</tbody>";
      target.find(".examples table").html(html);
      target.find(".examples tr").click(function() {
        let example_id = parseInt($(this).attr("row"));
        for (let [i, value] of config["examples"][example_id].entries()) {
          input_interfaces[i].load_example(value);
        }
      })
    };

    target.find(".screenshot").click(function() {
      $(".screenshot").hide();
      $(".screenshot_logo").show();
      html2canvas(target[0], {
        scrollX: 0,
        scrollY: -window.scrollY
      }).then(function(canvas) {
        saveAs(canvas.toDataURL(), 'screenshot.png');
        $(".screenshot").show();
        $(".screenshot_logo").hide();
      });
    });
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

    // io_master.flag($(".flag_message").val());
      }
    })

    return io_master;
}
function gradio_url(config, url, target) {
  return gradio(config, function(data) {
    return new Promise((resolve, reject) => {
      $.ajax({type: "POST",
        url: url,
        data: JSON.stringify({"data": data}),
        success: resolve,
        error: reject,
      });
    });              
  }, target);
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