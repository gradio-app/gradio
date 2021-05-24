import React from 'react';
import ComponentExample from '../component_example';
import classNames from "classnames";

class CheckboxGroupInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(selected_item) {
    let all_selected = this.props.value;
    if (all_selected.includes(selected_item)) {
      all_selected = all_selected.filter(item => item !== selected_item);
    } else {
      all_selected.push(selected_item);
    }
    this.props.handleChange(all_selected);
  }
  render() {
      return (<div className="input_checkbox_group">
        {this.props.choices.map((item, index) => {
          return <div className={classNames("checkbox_item", {
            "selected": this.props.value.includes(item)
          })} onClick={this.handleChange.bind(this, item)} key={index}>
            <div className="checkbox">
              <svg className="check" viewBox="-10 -10 20 20">
                <line x1="-7.5" y1="0" x2="-2.5" y2="5"></line>
                <line x1="-2.5" y1="5" x2="7.5" y2="-7.5"></line>
              </svg>
            </div>
            {item}
          </div>
        })}
      </div>)
  }
}

class CheckboxGroupInputExample extends ComponentExample {
  render() {
    return <div className="input_checkbox_group_example">{this.props.value.join(", ")}</div>
  }
}

export {CheckboxGroupInput, CheckboxGroupInputExample};
