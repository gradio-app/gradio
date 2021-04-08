let input_component_map = {
  "textbox": TextboxInput,
  "image": ImageInput,
}
let output_component_map = {
  "textbox": TextboxOutput,
  "label": LabelOutput,
}

class InterfacePanel extends React.Component {
  constructor(props) {
    super(props);
    this.clear = this.clear.bind(this);
    this.submit = this.submit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = this.get_default_state();
  }
  get_default_state() {
    let state = {};
    for (let [i, component] of this.props.input_components.entries()) {
      state[i] = component.default;
    }
    let index_start = this.props.input_components.length;
    for (let [i, component] of this.props.output_components.entries()) {
      state[index_start + i] = component.default;
    }
    state["predicting"] = false;
    state["error"] = false;
    state["has_changed"] = false;
    return state;
  }
  clear() {
    this.setState(this.get_default_state());
  }
  submit() {
    let input_state = [];
    for (let [i, component] of this.props.input_components.entries()) {
      input_state[i] = this.state[i];
    }
    this.setState({"submitting": true, "has_changed": false});
    this.props.fn(input_state, "predict").then((output) => {
      let index_start = this.props.input_components.length;
      for (let [i, value] of output["data"].entries()) {
        this.setState({[index_start + i]: value});
      }
      this.setState({"submitting": false});
      if (this.state.has_changed) {
        this.submit();
      }
    });
  }
  handleChange(_id, value) {
    let state_change = {[_id]: value, "has_changed": true};
    if (this.props.live && !(this.state.submitting)) {
      this.setState(state_change, this.submit);
    } else {
      this.setState(state_change);
    }
  }
  render() {
    let title = this.props.title ? <h1 className="title">{this.props.title}</h1> : false;
    let description = this.props.description ? <p className="description">{this.props.description}</p> : false;
    let article = this.props.article ? <p className="article">{this.props.article}</p> : false;
    let status = false;
    if (this.state.submitting) {
      status = (<div className="loading">
        <img className="loading_in_progress" src="/static/img/logo_loading.gif"/>
      </div>)
    } else if (this.state.error) {
      status = (<div className="loading">
        <img className="loading_failed" src="/static/img/logo_error.png"/>
      </div>)
    }
    return (
    <div>
      {title}
      {description}
      <div className="panels" style={
        {"alignItems" : this.props.layout == "unaligned" ? "flex-start" : "stretch",
         "flexDirection": this.props.layout == "vertical" ? "column" : "row"}}>
        <div className="panel input_panel">
          <div className="input_components">
            {this.props.input_components.map((component, index) => {
              const Component = input_component_map[component.name];
              return (
              <div className="component" key={index}>
                <div className="panel_header">{component.label}</div>
                <Component {...component} handleChange={this.handleChange.bind(this, index)} value={this.state[index]} />
              </div>);
            })}
          </div>
          <div className="panel_buttons">
            <button className="clear panel_button" onClick={this.clear.bind(this)}>CLEAR</button>
            {this.props.live ? false :
              <button className="submit panel_button"  onClick={this.submit.bind(this)}>SUBMIT</button>
            }
          </div>
        </div>
        <div className="panel output_panel">
          {status}
          <div className="output_components" style={{"opacity" : status && !this.props.live ? 0.5 : 1}}>
            {this.props.output_components.map((component, index) => {
              const Component = output_component_map[component.name];
              const key = this.props.input_components.length + index;
              return (
              <div className="component" key={key}>
                <div className="panel_header">{component.label}</div>
                <Component {...component}  handleChange={this.handleChange.bind(this, key)} value={this.state[key]}/>
              </div>);
            })}
          </div>
          <div className="panel_buttons">
            <button className="interpret inactive panel_button">INTERPRET</button>
            <button className="screenshot panel_button left_panel_button">SCREENSHOT</button>
            <button className="record panel_button right_panel_button">GIF</button>
            <div className="screenshot_logo hidden">
              <img src="/static/img/logo_inline.png" />
              <button className='record_stop'>
                <div className='record_square'></div>
              </button>
            </div>
            <div className="flag panel_button inactive">
              FLAG
              <div className="dropcontent"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="interpretation_explained hidden">
        <h4>Interpretation Legend <span className='close_explain'>&#10006;</span></h4>
        <div className='interpretation_legend'>
          <div>&larr; Decreased output score / confidence</div>
          <div>Increased output score / confidence &rarr;</div>
        </div>
        <p>When you click Interpret, you can see how different parts of the input contributed to the final output. The legend above will highlight each of the input components as follows:</p>
        <ul></ul>
      </div>
      <div className="examples hidden">
        <h4>Examples</h4>
        <div className="examples_control">
          <div className="examples_control_left">
            <button className="run_examples examples-content">Run All</button>
            <button className="load_prev examples-content">Load Previous <small>CTRL + <span className="backward">&#10140;</span></small></button>
            <button className="load_next examples-content">Load Next <small>CTRL + &#10140;</small></button>
            <button className="order_similar examples-content embedding">Order by Similarity</button>
            <button className="view_embeddings examples-content embedding">View Embeddings</button>
            <button className="update_embeddings embeddings-content hidden">Update Embeddings</button>
            <button className="view_examples embeddings-content hidden">View Examples</button>
          </div>
          <div className="examples_control_right">
            <button className="table_examples">
              <svg width="40" height="24"><rect x="0" y="0" width="40" height="6"></rect><rect x="0" y="9" width="40" height="6"></rect><rect x="0" y="18" width="40" height="6"></rect></svg>
            </button>
            <button className="gallery_examples current">
              <svg width="40" height="24"><rect x="0" y="0" width="18" height="40"></rect><rect x="22" y="0" width="18" height="40"></rect></svg>
            </button>
          </div>
        </div>
        <div className="pages hidden">Page:</div>
        <table className="examples-content">
        </table>
        <div className="plot embeddings-content hidden">
          <canvas id="canvas" width="400px" height="300px"></canvas>
        </div>
      </div>
      {article}
    </div>
    )
  }
}

function gradio(config, fn, target, example_file_path) {
  target = $(target);
  let io_master = Object.create(io_master_template);
  io_master.fn = fn
  io_master.target = target;
  io_master.config = config;
  io_master.example_file_path = example_file_path;

  ReactDOM.render(<InterfacePanel {...config} fn={fn} />, target[0]);
  function clear_all() {
    for (let input_component of input_components) {
      input_component.clear();
    }
    for (let output_component of output_components) {
      output_component.clear();
    }
    target.find(".loading").addClass("hidden");
    target.find(".loading_time").text("");
    target.find(".output_components").css("opacity", 1);
    target.find(".flag").addClass("inactive");
    target.find(".interpret").addClass("inactive");
    io_master.last_input = null;
    io_master.last_output = null;
  }

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
  }
  function load_example(example_id) {
    clear_all();
    if (!(example_id in config["examples"])) {
      return;
    }
    for (let [i, value] of config["examples"][example_id].entries()) {
      if (i < input_components.length) {
        input_components[i].load_example(value);
      } else if (i - input_components.length < output_components.length) {
        let output_component = output_components[i - input_components.length];
        if ("load_example" in output_component) {
          output_component.load_example(value);
        } else {
          output_component.output(value)
        }
      }
    };
    if (io_master.loaded_examples && example_id in io_master.loaded_examples) {
      io_master.output({ "data": io_master.loaded_examples[example_id] });
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
    var current_example = io_master.current_example;
    if (current_example == null) {
      new_index = 0;
    } else {
      new_index = (io_master.order_mapping.indexOf(current_example) + 1 + config.examples.length) % config.examples.length;
    }
    load_example(io_master.order_mapping[new_index]);
  }
  function prev_example() {
    var current_example = io_master.current_example;
    if (current_example == null) {
      new_index = 0;
    } else {
      new_index = (io_master.order_mapping.indexOf(current_example) - 1 + config.examples.length) % config.examples.length;
    }
    load_example(io_master.order_mapping[new_index]);
  }
  function load_page() {
    var page_num = io_master.current_page;
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
        if (j < input_components.length) {
          if (input_components[j].load_example_preview) {
            new_col = input_components[j].load_example_preview(new_col);
          }
        } else {
          let k = j - input_components.length;
          if (k < output_components.length && output_components[k].load_example_preview) {
            new_col = output_components[k].load_example_preview(new_col);
          }
        }
        html += "<td>" + new_col + "</td>";
      }
      if (io_master.loaded_examples && example_id in io_master.loaded_examples) {
        output_values = io_master.loaded_examples[example_id]
        for (let j = 0; j < output_values.length; j++) {
          let output_component = io_master.output_components[j];
          let example_preview = output_values[j];
          if (output_component.load_example_preview) {
            example_preview = output_component.load_example_preview(example_preview)
          }
          html += "<td>" + example_preview + "</td>";
        }
      }
      html += "</tr>";
    }
    target.find(".examples > table > tbody").html(html);
  }
  // if (config["examples"]) {
  //   target.find(".examples").removeClass("hidden");
  //   let html = "<thead>"
  //   for (let input_component of config["input_components"]) {
  //     html += "<th>" + input_component[1]["label"] + "</th>";
  //   }
  //   if (config["examples"].length > 0 && config["examples"][0].length > config["input_components"].length) {
  //     for (let output_component of config["output_components"]) {
  //       html += "<th>" + output_component[1]["label"] + "</th>";
  //     }
  //   }
  //   html += "</thead>";
  //   html += "<tbody className='examples_body'></tbody>";
  //   target.find(".examples table").html(html);
  //   io_master.current_page = 0;
  //   io_master.order_mapping = [...Array(config.examples.length).keys()];
  //   let page_count = Math.ceil(config.examples.length / config.examples_per_page)
  //   if (page_count > 1) {
  //     target.find(".pages").removeClass("hidden");
  //     let html = "";
  //     for (let i = 0; i < page_count; i++) {
  //       html += `<button className='page' page='${i}'>${i + 1}</button>`
  //     }
  //     target.find(".pages").append(html);
  //   }
  //   load_page();
  //   window.onhashchange = hash_handler;
  //   hash_handler();
  //   target.on("click", ".examples_body > tr", function () {
  //     let example_id = parseInt($(this).attr("row"));
  //     load_example(example_id);
  //   })
  //   target.on("click", ".page", function () {
  //     let page_num = parseInt($(this).attr("page"));
  //     io_master.current_page = page_num;
  //     load_page();
  //   })
  //   set_table_mode = function () {
  //     target.find(".examples-content").removeClass("gallery");
  //     target.find(".examples_control_right button").removeClass("current");
  //     target.find(".table_examples").addClass("current");
  //   }
  //   set_gallery_mode = function () {
  //     target.find(".examples-content").addClass("gallery");
  //     target.find(".examples_control_right button").removeClass("current");
  //     target.find(".gallery_examples").addClass("current");
  //   }
  //   target.on("click", ".table_examples", set_table_mode);
  //   target.on("click", ".gallery_examples", set_gallery_mode);
  //   if (config["examples"].length > 0 && config["examples"][0].length > 1) {
  //     set_table_mode();
  //   } else {
  //     set_gallery_mode();
  //   }
  //   target.find(".load_prev").click(prev_example);
  //   target.find(".load_next").click(next_example);
  //   target.find(".order_similar").click(function () {
  //     io_master.score_similarity(function () {
  //       io_master.current_page = 0
  //       io_master.current_example = null;
  //       load_page();
  //     })
  //   });
  //   target.find(".view_examples").click(function () {
  //     target.find(".examples-content").removeClass("hidden");
  //     target.find(".embeddings-content").addClass("hidden");
  //   });
  //   target.find(".update_embeddings").click(function () {
  //     io_master.update_embeddings(function (output) {
  //       embedding_chart.data.datasets[0].data.push(output["sample_embedding_2d"][0]);
  //       console.log(output["sample_embedding_2d"][0])
  //       embedding_chart.update();
  //     })
  //   });
  //   target.find(".view_embeddings").click(function () {
  //     io_master.view_embeddings(function (output) {
  //       let ctx = $('#canvas')[0].getContext('2d');
  //       let backgroundColors = getBackgroundColors(io_master);
  //       embedding_chart = new Chart(ctx, {
  //         type: 'scatter',
  //         data: {
  //           datasets: [{
  //             label: 'Sample Embedding',
  //             data: output["sample_embedding_2d"],
  //             backgroundColor: 'rgb(0, 0, 0)',
  //             borderColor: 'rgb(0, 0, 0)',
  //             pointRadius: 13,
  //             pointHoverRadius: 13,
  //             pointStyle: 'rectRot',
  //             showLine: true,
  //             fill: false,
  //           }, {
  //             label: 'Dataset Embeddings',
  //             data: output["example_embeddings_2d"],
  //             backgroundColor: backgroundColors,
  //             borderColor: backgroundColors,
  //             pointRadius: 7,
  //             pointHoverRadius: 7
  //           }]
  //         },
  //         options: {
  //           legend: { display: false }
  //         }
  //       });
  //       $("#canvas")[0].onclick = function (evt) {
  //         var activePoints = embedding_chart.getElementsAtEvent(evt);
  //         var firstPoint = activePoints[0];
  //         if (firstPoint._datasetIndex == 1) { // if it's from the sample embeddings dataset
  //           load_example(firstPoint._index)
  //         }
  //       };

  //       target.find(".examples-content").addClass("hidden");
  //       target.find(".embeddings-content").removeClass("hidden");
  //     })
  //   });
  //   $("body").keydown(function (e) {
  //     if ($(document.activeElement).attr("type") == "text" || $(document.activeElement).attr("type") == "textarea") {
  //       return;
  //     }
  //     e = e || window.event;
  //     var keyCode = e.keyCode || e.which,
  //       arrow = { left: 37, up: 38, right: 39, down: 40 };
  //     if (e.ctrlKey) {
  //       if (keyCode == arrow.left) {
  //         prev_example();
  //       } else if (keyCode == arrow.right) {
  //         next_example();
  //       }
  //     }
  //   });
  // };


  target.find(".screenshot").click(function () {
    $(".screenshot, .record").hide();
    $(".screenshot_logo").removeClass("hidden");
    $(".record_stop").hide();
    html2canvas(target[0], {
      scrollX: 0,
      scrollY: -window.scrollY
    }).then(function (canvas) {
      saveAs(canvas.toDataURL(), 'screenshot.png');
      $(".screenshot, .record").show();
      $(".screenshot_logo").addClass("hidden");
    });
  });
  target.find(".record").click(function () {
    $(".screenshot, .record").hide();
    $(".screenshot_logo").removeClass("hidden");
    $(".record_stop").show();
    target.append("<canvas className='recording_draw hidden' width=640 height=480></canvas>");
    target.append("<video className='recording hidden' autoplay playsinline></video>");
    navigator.mediaDevices.getDisplayMedia(
      { video: { width: 9999, height: 9999 } }
    ).then(stream => {
      video = target.find("video.recording")[0];
      canvas = target.find("canvas.recording_draw")[0];
      io_master.recording = { frames: [], stream: stream };
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
  target.find(".record_stop").click(function () {
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
      target.find(".flag .dropcontent div").click(function () {
        if (io_master.last_output) {
          target.find(".flag .dropcontent");
          flash_flag();
          io_master.flag($(this).text());
        }
      });

    } else {
      target.find(".flag").click(function () {
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
  target.find(".interpret").click(function () {
    target.find(".interpretation_explained").removeClass("hidden");
    if (io_master.last_output) {
      io_master.interpret();
    }
  });
  target.find(".run_examples").click(function () {
    if (!io_master.has_loaded_examples) {
      this.has_loaded_examples = true;
      let html = ""
      for (let i = 0; i < io_master.output_components.length; i++) {
        html += "<th>" + config.output_components[i][1]["label"] + "</th>";
      }
      target.find(".examples > table > thead > tr").append(html);
    }
    io_master.has_loaded_examples = true;
    io_master.submit_examples(load_page);
  })

  $(".input_panel").on("mouseover", ".alternate", function () {
    let interface_index = $(this).closest(".interface").attr("interface_id");
    let alternate_index = $(this).attr("alternate_index");
    io_master.alternative_interpret(interface_index, alternate_index);
  })
  $(".input_panel").on("mouseout", ".alternate", function () {
    io_master.alternative_interpret(false);
  })

  return io_master;
}
function gradio_url(config, url, target, example_file_path) {
  return gradio(config, function (data, action) {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "POST",
        url: url + action + "/",
        data: JSON.stringify({ "data": data }),
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
