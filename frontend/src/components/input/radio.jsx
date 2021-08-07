import React from "react";
import BaseComponent from "../base_component";
import ComponentExample from "../component_example";
import classNames from "classnames";
import { getSaliencyColor } from "../../utils";

class RadioInput extends BaseComponent {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(selected_item) {
    this.props.handleChange(selected_item);
  }
  render() {
    return (
      <div className="input_radio">
        {this.props.choices.map((item, index) => {
          return (
            <div key={index}>
              <div
                className={classNames("radio_item", {
                  selected: item === this.props.value
                })}
                onClick={this.handleChange.bind(this, item)}
              >
                {this.props.interpretation === null ? (
                  <div className="radio_circle"></div>
                ) : (
                  <div
                    className="radio_circle"
                    style={{
                      backgroundColor: getSaliencyColor(
                        this.props.interpretation[index]
                      )
                    }}
                  ></div>
                )}
                {item}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

class RadioInputExample extends ComponentExample {
  render() {
    return <div className="input_radio_example">{this.props.value}</div>;
  }
}

export { RadioInput, RadioInputExample };
