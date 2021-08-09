import React from "react";
import BaseComponent from "../base_component";
import ComponentExample from "../component_example";
import classNames from "classnames";
import { getSaliencyColor } from "../../utils";

class CheckboxInput extends BaseComponent {
  constructor(props) {
    super(props);
  }
  handleChange = () => {
    this.props.handleChange(this.props.value !== true);
  };
  render() {
    console.log("render checkbox");
    return (
      <div className="input_checkbox">
        <div
          className={classNames("checkbox_item", {
            selected: this.props.value
          })}
          onClick={this.handleChange}
        >
          {this.props.interpretation === null ? (
            <div className="checkbox">
              <svg className="check" viewBox="-10 -10 20 20">
                <line x1="-7.5" y1="0" x2="-2.5" y2="5"></line>
                <line x1="-2.5" y1="5" x2="7.5" y2="-7.5"></line>
              </svg>
            </div>
          ) : (
            <div class="interpretation">
              <div
                class="interpretation_box"
                style={{
                  backgroundColor: getSaliencyColor(
                    this.props.interpretation[0]
                  )
                }}
              ></div>
              <div
                class="interpretation_box"
                style={{
                  backgroundColor: getSaliencyColor(
                    this.props.interpretation[1]
                  )
                }}
              >
                <svg className="interpret_check" viewBox="-10 -10 20 20">
                  <line x1="-7.5" y1="0" x2="-2.5" y2="5"></line>
                  <line x1="-2.5" y1="5" x2="7.5" y2="-7.5"></line>
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

class CheckboxInputExample extends ComponentExample {
  render() {
    return (
      <div className="input_checkbox_example">
        {JSON.stringify(this.props.value)}
      </div>
    );
  }
}

export { CheckboxInput, CheckboxInputExample };
