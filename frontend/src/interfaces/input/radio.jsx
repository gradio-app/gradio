import React from 'react';
import ComponentExample from '../component_example';
import classNames from "classnames";

class RadioInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(selected_item) {
    this.props.handleChange(selected_item);
  }
  render() {
      return (<div className="input_radio">
        {this.props.choices.map((item, index) => {
          return <div className={classNames("radio_item", {
            "selected": item === this.props.value
          })} onClick={this.handleChange.bind(this, item)} key={index}>
            <div className="radio_circle"></div>
            {item}
          </div>
        })}
      </div>)
  }
}

class RadioInputExample extends ComponentExample {
  render() {
    return <div className="input_radio_example">{this.props.value}</div>
  }
}

export {RadioInput, RadioInputExample};
