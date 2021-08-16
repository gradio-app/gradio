import React from "react";
import html2canvas from "html2canvas-objectfit-fix";
import { input_component_map, output_component_map } from "./components";
import { saveAs } from "./utils";
import ReactDOM from "react-dom";
import classNames from "classnames";

import logo_loading from "./static/img/logo_loading.jpg";
import logo_error from "./static/img/logo_error.png";
import logo from "./static/img/logo.svg";
import("./themes/defaults.scss");
import("./themes/huggingface.scss");
import("./themes/compact.scss");

export class GradioPage extends React.Component {
  render() {
    return (
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
        <a
          href="https://gradio.app"
          target="_blank"
          className="footer"
          rel="noreferrer"
        >
          <span>built with</span>
          <img className="logo" src={logo} alt="logo" />
        </a>
      </div>
    );
  }
}

export class GradioInterface extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.get_default_state();
    this.state["examples_page"] = 0;
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
    state["interpretation"] = null;
    state["just_flagged"] = false;
    state["has_changed"] = false;
    state["example_id"] = null;
    state["flag_index"] = null;
    state["queue_index"] = null;
    return state;
  };
  clear = () => {
    this.setState(this.get_default_state());
  };
  submit = () => {
    let input_state = [];
    for (let i = 0; i < this.props.input_components.length; i++) {
      if (this.state[i] === null) {
        return;
      }
      input_state[i] = this.state[i];
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
        let index_start = this.props.input_components.length;
        let new_state = {};
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
      for (let i = 0; i < this.props.input_components.length; i++) {
        component_state["input_data"].push(this.state[i]);
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
    if (!this.state.complete) {
      return;
    }
    let input_state = [];
    for (let i = 0; i < this.props.input_components.length; i++) {
      if (this.state[i] === null) {
        return;
      }
      input_state[i] = this.state[i];
    }
    this.setState({ submitting: true, has_changed: false, error: false });
    this.props
      .fn(input_state, "interpret")
      .then((output) => {
        this.setState({
          interpretation: output["interpretation_scores"],
          submitting: false
        });
      })
      .catch((e) => {
        console.error(e);
        this.setState({
          error: true,
          submitting: false
        });
      });
  };
  removeInterpret = () => {
    this.setState({ interpretation: null });
  };
  queueCallback = (queue_index) => {
    this.setState({"queue_index": queue_index});
  }
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
    let state_change = {};
    this.setState({ example_id: example_id });
    for (let [i, item] of this.props.examples[example_id].entries()) {
      let ExampleComponent =
        i < this.props.input_components.length
          ? input_component_map[this.props.input_components[i].name][1]
          : output_component_map[
          this.props.output_components[
            i - this.props.input_components.length
          ].name
          ][1];
      state_change[i] = ExampleComponent.preprocess(
        item,
        this.examples_dir
      ).then((data) => {
        this.handleChange(i, data);
      });
    }
  };
  render() {
    let status = false;
    if (this.state.submitting) {
      status = (
        <div className="loading">
          {this.state.queue_index !== null ? "queued @ " + this.state.queue_index : false}
          <img alt="loading" src={logo_loading} />
        </div>
      );
    } else if (this.state.error) {
      status = (
        <div className="loading">
          <img className="loading_failed" alt="error" src={logo_error} />
        </div>
      );
    }
    return (
      <div className="gradio_interface" theme={this.props.theme}>
        <div className={classNames("panels", this.props.layout)}>
          <div
            className={classNames("panel", {
              flex: this.props.layout === "horizontal",
              "flex-col": this.props.layout === "horizontal"
            })}
          >
            <div className="component_set">
              {this.props.input_components.map((component, index) => {
                const Component = input_component_map[component.name][0];
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
                "opacity-50": status && !this.props.live
              })}
            >
              {status}
              {this.props.output_components.map((component, index) => {
                const Component = output_component_map[component.name][0];
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
          <GradioInterfaceExamples
            examples={this.props.examples}
            examples_dir={this.examples_dir}
            example_id={this.state.example_id}
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
  render() {
    return (
      <div className="examples">
        <h4>Examples</h4>
        <div className="examples_control">
          <button className="load_prev examples-content">
            Load Previous{" "}
            <div className="shortcut">
              CTRL +{" "}
              <span
                style={{ display: "inline-block", transform: "scale(-1, 1)" }}
              >
                &#10140;
              </span>
            </div>
          </button>
          <button className="load_next examples-content">
            Load Next <div className="shortcut">CTRL + &#10140;</div>
          </button>
          <button className="table_examples">
            <svg width="40" height="24">
              <rect x="0" y="0" width="40" height="6"></rect>
              <rect x="0" y="9" width="40" height="6"></rect>
              <rect x="0" y="18" width="40" height="6"></rect>
            </svg>
          </button>
          <button className="gallery_examples current">
            <svg width="40" height="24">
              <rect x="0" y="0" width="18" height="40"></rect>
              <rect x="22" y="0" width="18" height="40"></rect>
            </svg>
          </button>
        </div>
        <div className="pages hidden">Page:</div>
        <table className="examples_table">
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
            {this.props.examples.map((example_row, i) => {
              return (
                <tr
                  key={i}
                  className={classNames({
                    selected: i === this.props.example_id
                  })}
                  onClick={() => this.props.handleExampleChange(i)}
                >
                  {example_row.map((example_data, j) => {
                    let ExampleComponent =
                      input_component_map[
                      this.props.input_components[j].name
                      ][1];
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
      </div>
    );
  }
}
