import React from "react";
import html2canvas from "html2canvas-objectfit-fix";
import { input_component_set, output_component_set } from "./components";
import { saveAs } from "./utils";
import ReactDOM from "react-dom";
import classNames from "classnames";

import logo_loading from "./static/img/logo_loading.jpg";
import logo_error from "./static/img/logo_error.png";
import logo from "./static/img/logo.svg";
import("./themes/defaults.scss");
import("./themes/huggingface.scss");
import("./themes/grass.scss");
import("./themes/peach.scss");

export class GradioPage extends React.Component {
  render() {
    return (
      <div class={"gradio_bg"} theme={this.props.theme}>
        <div class="gradio_page">
          <div class="content">
            {this.props.title ? (
              <h1 className="title">{this.props.title}</h1>
            ) : (
              false
            )}
            {this.props.description ? (
              <p className="description">{this.props.description}</p>
            ) : (
              false
            )}
            <GradioInterface {...this.props} />
            {this.props.article ? (
              <p
                className="article prose"
                dangerouslySetInnerHTML={{ __html: this.props.article }}
              />
            ) : (
              false
            )}
          </div>
          <div className="footer">
            <a 
            href="api" 
            target="_blank"
            rel="noreferrer">
            view the api <img className="logo" src="https://i.ibb.co/6DVLqmf/noun-tools-2220412.png" alt="api"/>
          </a> | <a
            href="https://gradio.app"
            target="_blank"
            rel="noreferrer"
          > built with 
            <img className="logo" src={logo} alt="logo" />
          </a>
          </div>
        </div>
      </div>
    );
  }
}

export class GradioInterface extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.get_default_state();
    this.pending_response = false;
    this.state["examples_page"] = 0;
    this.state["avg_duration"] = Array.isArray(this.props.avg_durations)
      ? this.props.avg_durations[0]
      : null;
    this.examples_dir =
      process.env.REACT_APP_BACKEND_URL +
      (this.props.examples_dir === null
        ? "file" +
          this.props.examples_dir +
          (this.props.examples_dir.endswith("/") ? "" : "/")
        : "file");
  }
  get_default_state = () => {
    let state = {};
    for (let [i, component] of this.props.input_components.entries()) {
      state[i] = component.default !== undefined ? component.default : null;
    }
    let index_start = this.props.input_components.length;
    for (let [i, component] of this.props.output_components.entries()) {
      state[index_start + i] =
        component.default !== undefined ? component.default : null;
    }
    state["submitting"] = false;
    state["error"] = false;
    state["complete"] = false;
    state["last_duration"] = null;
    state["interpretation"] = null;
    state["just_flagged"] = false;
    state["has_changed"] = false;
    state["example_id"] = null;
    state["flag_index"] = null;
    state["queue_index"] = null;
    state["initial_queue_index"] = null;
    return state;
  };
  clear = () => {
    this.pending_response = false;
    this.setState(this.get_default_state());
  };
  submit = () => {
    if (this.pending_response) {
      return;
    }
    this.pending_response = true;
    let input_state = [];
    for (let [i, input_component] of this.props.input_components.entries()) {
      if (
        this.state[i] === null &&
        this.props.input_components[i].optional !== true
      ) {
        return;
      }
      let InputComponentClass = input_component_set.find(
        (c) => c.name === input_component.name
      ).component;
      input_state[i] = InputComponentClass.postprocess(this.state[i]);
    }
    this.setState({
      submitting: true,
      has_changed: false,
      error: false,
      flag_index: null
    });
    this.props
      .fn(input_state, "predict", this.queueCallback)
      .then((output) => {
        if (output["error"] != null) {
          console.error("Error:", output["error"]);
        }
        if (!this.pending_response) {
          return;
        }
        this.pending_response = false;
        let index_start = this.props.input_components.length;
        let new_state = {};
        new_state["last_duration"] = output["durations"][0];
        new_state["avg_duration"] = output["avg_durations"][0];
        for (let [i, value] of output["data"].entries()) {
          new_state[index_start + i] = value;
        }
        if (output["flag_index"] !== null) {
          new_state["flag_index"] = output["flag_index"];
        }
        new_state["submitting"] = false;
        new_state["complete"] = true;
        this.setState(new_state);
        if (this.props.live && this.state.has_changed) {
          this.submit();
        }
      })
      .catch((e) => {
        console.error(e);
        this.pending_response = false;
        this.setState({
          error: true,
          submitting: false
        });
      });
  };
  flag = (flag_option) => {
    if (!this.state.complete) {
      return;
    }
    let component_state = { input_data: [], output_data: [] };
    if (this.state.flag_index !== undefined) {
      component_state["flag_index"] = this.state.flag_index;
    } else {
      for (let [i, input_component] of this.props.input_components.entries()) {
        let InputComponentClass = input_component_set.find(
          (c) => c.name === input_component.name
        ).component;
        component_state["input_data"].push(
          InputComponentClass.postprocess(this.state[i])
        );
      }
      for (let i = 0; i < this.props.output_components.length; i++) {
        component_state["output_data"].push(
          this.state[this.props.input_components.length + i]
        );
      }
    }
    this.setState({ just_flagged: true });
    window.setTimeout(() => {
      this.setState({ just_flagged: false });
    }, 1000);
    component_state["flag_option"] = flag_option;
    this.props.fn(component_state, "flag");
  };
  interpret = () => {
    if (this.pending_response) {
      return;
    }
    this.pending_response = true;
    let input_state = [];
    for (let [i, input_component] of this.props.input_components.entries()) {
      if (
        this.state[i] === null &&
        this.props.input_components[i].optional !== true
      ) {
        return;
      }
      let InputComponentClass = input_component_set.find(
        (c) => c.name === input_component.name
      ).component;
      input_state[i] = InputComponentClass.postprocess(this.state[i]);
    }
    this.setState({ submitting: true, has_changed: false, error: false });
    this.props
      .fn(input_state, "interpret", this.queueCallback)
      .then((output) => {
        if (!this.pending_response) {
          return;
        }
        this.pending_response = false;
        this.setState({
          interpretation: output["interpretation_scores"],
          submitting: false
        });
      })
      .catch((e) => {
        console.error(e);
        this.pending_response = false;
        this.setState({
          error: true,
          submitting: false
        });
      });
  };
  removeInterpret = () => {
    this.setState({ interpretation: null });
  };
  queueCallback = (queue_index, is_initial) => {
    let new_state = {};
    if (is_initial === true) {
      new_state["initial_queue_index"] = queue_index;
    }
    new_state["queue_index"] = queue_index;
    this.setState(new_state);
  };
  takeScreenshot = () => {
    html2canvas(ReactDOM.findDOMNode(this).parentNode).then((canvas) => {
      saveAs(canvas.toDataURL(), "screenshot.png");
    });
  };
  handleChange = (_id, value) => {
    let state_change = { [_id]: value, has_changed: true };
    if (this.props.live && !this.state.submitting) {
      this.setState(state_change, this.submit);
    } else {
      this.setState(state_change);
    }
  };
  handleExampleChange = (example_id) => {
    this.setState({ example_id: example_id });
    for (let [i, item] of this.props.examples[example_id].entries()) {
      let ExampleComponent;
      if (i < this.props.input_components.length) {
        let component_name = this.props.input_components[i].name;
        let component_data = input_component_set.find(
          (c) => c.name === component_name
        );
        ExampleComponent = component_data.example_component;
      } else {
        let component_name =
          this.props.output_components[i - this.props.input_components.length]
            .name;
        let component_data = output_component_set.find(
          (c) => c.name === component_name
        );
        ExampleComponent = component_data.example_component;
      }
      ExampleComponent.preprocess(item, this.examples_dir).then((data) => {
        this.handleChange(i, data);
      });
    }
  };
  render() {
    let status = false;
    if (this.state.submitting) {
      let expected_duration = this.state.avg_duration;
      if (this.state.initial_queue_index && this.state.avg_duration !== null) {
        expected_duration *= this.state.initial_queue_index + 2;
      }
      status = (
        <div className="loading">
          <MemoizedGradioTimer expected_duration={expected_duration} />
          {this.state.queue_index !== null && this.state.queue_index >= 0
            ? "queued @ " + this.state.queue_index
            : false}
          <img alt="loading" src={logo_loading} />
        </div>
      );
    } else if (this.state.error) {
      status = (
        <div className="loading">
          <img className="loading_failed" alt="error" src={logo_error} />
        </div>
      );
    } else if (this.state.complete && this.state.last_duration !== null) {
      status = (
        <div className="loading">
          {this.state.last_duration.toFixed(2) + "s"}
        </div>
      );
    }
    return (
      <div className="gradio_interface">
        <div className={classNames("panels", this.props.layout)}>
          <div
            className={classNames("panel", {
              flex: this.props.layout === "horizontal",
              "flex-col": this.props.layout === "horizontal"
            })}
          >
            <div className="component_set">
              {this.props.input_components.map((component, index) => {
                const Component = input_component_set.find(
                  (c) => c.name === component.name
                ).memoized_component;
                return (
                  <div className="component" key={index}>
                    <div className="panel_header">{component.label}</div>
                    <Component
                      key={index}
                      {...component}
                      handleChange={this.handleChange.bind(this, index)}
                      value={this.state[index]}
                      interpretation={
                        this.state["interpretation"] === null
                          ? null
                          : this.state["interpretation"][index]
                      }
                    />
                  </div>
                );
              })}
            </div>
            <div className="panel_buttons">
              <button className="panel_button" onClick={this.clear}>
                Clear
              </button>
              {this.props.live ? (
                false
              ) : (
                <button className="panel_button submit" onClick={this.submit}>
                  Submit
                </button>
              )}
            </div>
          </div>
          <div
            className={classNames("panel", {
              flex: this.props.layout === "horizontal",
              "flex-col": this.props.layout === "horizontal"
            })}
          >
            <div
              className={classNames("component_set", "relative", {
                "opacity-50": this.pending_response && !this.props.live
              })}
            >
              {status}
              {this.props.output_components.map((component, index) => {
                const Component = output_component_set.find(
                  (c) => c.name === component.name
                ).memoized_component;
                const key = this.props.input_components.length + index;
                return this.state[key] === null ? (
                  false
                ) : (
                  <div className="component" key={key}>
                    <div className="panel_header">{component.label}</div>
                    <Component
                      {...component}
                      handleChange={this.handleChange.bind(this, key)}
                      value={this.state[key]}
                    />
                  </div>
                );
              })}
            </div>
            <div className="panel_buttons">
              {this.props.allow_interpretation ? (
                this.state.interpretation === null ? (
                  <button
                    className={classNames("panel_button", {
                      disabled: this.state.complete === false
                    })}
                    onClick={this.interpret}
                  >
                    Interpret
                  </button>
                ) : (
                  <button
                    className="panel_button"
                    onClick={this.removeInterpret}
                  >
                    Hide
                  </button>
                )
              ) : (
                false
              )}
              {this.props.allow_screenshot ? (
                <button onClick={this.takeScreenshot} className="panel_button">
                  Screenshot
                </button>
              ) : (
                false
              )}
              {this.props.allow_flagging ? (
                this.props.flagging_options === null ? (
                  <button
                    className={classNames("panel_button", "flag", {
                      disabled: this.state.complete === false
                    })}
                    onClick={this.flag.bind(this, null)}
                  >
                    {this.state.just_flagged ? "Flagged" : "Flag"}
                  </button>
                ) : (
                  <button
                    className={classNames("panel_button", "flag", {
                      disabled: this.state.complete === false
                    })}
                  >
                    {this.state.just_flagged ? "Flagged" : "Flag ▼"}
                    <div className="dropcontent">
                      {this.props.flagging_options.map((item) => (
                        <div onClick={this.flag.bind(this, item)}>{item}</div>
                      ))}
                    </div>
                  </button>
                )
              ) : (
                false
              )}
            </div>
          </div>
        </div>
        {this.props.examples ? (
          <MemoizedGradioInterfaceExamples
            examples={this.props.examples}
            examples_dir={this.examples_dir}
            example_id={this.state.example_id}
            examples_per_page={this.props.examples_per_page}
            input_components={this.props.input_components}
            output_components={this.props.output_components}
            handleExampleChange={this.handleExampleChange}
          />
        ) : (
          false
        )}
      </div>
    );
  }
}

class GradioInterfaceExamples extends React.Component {
  constructor(props) {
    super(props);
    this.state = { page: 0 };
  }
  set_page(page) {
    this.setState({ page: page });
  }
  render() {
    let selected_examples = this.props.examples.slice();
    let examples_count = this.props.examples.length;
    let paginate = examples_count > this.props.examples_per_page;
    let page_count = 1;
    let visible_pages = [];
    if (paginate) {
      selected_examples = selected_examples.slice(
        this.state.page * this.props.examples_per_page,
        (this.state.page + 1) * this.props.examples_per_page
      );
      page_count = Math.ceil(examples_count / this.props.examples_per_page);
      [0, this.state.page, page_count - 1].forEach((anchor) => {
        for (let i = anchor - 2; i <= anchor + 2; i++) {
          if (i >= 0 && i < page_count && !visible_pages.includes(i)) {
            if (
              visible_pages.length > 0 &&
              i - visible_pages[visible_pages.length - 1] > 1
            ) {
              visible_pages.push(null);
            }
            visible_pages.push(i);
          }
        }
      });
    }
    return (
      <div className="examples">
        <h4>Examples</h4>
        <table
          className={classNames("examples_table", {
            gallery: this.props.input_components.length === 1
          })}
        >
          <thead>
            <tr>
              {this.props.input_components.map((component, i) => {
                return <th key={i}>{component.label}</th>;
              })}
              {this.props.examples[0].length >
              this.props.input_components.length
                ? this.props.output_components.map((component, i) => {
                    return (
                      <th key={i + this.props.input_components.length}>
                        {component.label}
                      </th>
                    );
                  })
                : false}
            </tr>
          </thead>
          <tbody>
            {selected_examples.map((example_row, page_i) => {
              let i = page_i + this.state.page * this.props.examples_per_page;
              return (
                <tr
                  key={i}
                  className={classNames({
                    selected: i === this.props.example_id
                  })}
                  onClick={() => this.props.handleExampleChange(i)}
                >
                  {example_row.map((example_data, j) => {
                    let ExampleComponent = input_component_set.find(
                      (c) => c.name === this.props.input_components[j].name
                    ).example_component;
                    return (
                      <td>
                        <ExampleComponent
                          examples_dir={this.props.examples_dir}
                          value={example_data}
                          key={j}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        {paginate ? (
          <div class="pages">
            Pages:
            {visible_pages.map((page) =>
              page === null ? (
                <div>...</div>
              ) : (
                <button
                  className={classNames("page", {
                    selected: page === this.state.page
                  })}
                  key={page}
                  onClick={this.set_page.bind(this, page)}
                >
                  {page + 1}
                </button>
              )
            )}
          </div>
        ) : (
          false
        )}
      </div>
    );
  }
}

class GradioTimer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { time: new Date(), start_time: new Date() };
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({
      time: new Date()
    });
  }

  render() {
    return (
      <div>
        {Math.round(
          (this.state.time.getTime() - this.state.start_time.getTime()) / 1000
        )}
        .0
        {this.props.expected_duration !== null ? (
          <>/{this.props.expected_duration.toFixed(1)}</>
        ) : (
          false
        )}
        s
      </div>
    );
  }
}

const MemoizedGradioInterfaceExamples = React.memo(GradioInterfaceExamples);
const MemoizedGradioTimer = React.memo(GradioTimer);
