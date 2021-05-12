import React from 'react';
import classNames from "classnames";

class CheckboxGroupInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(selected_index) {
    let all_selected = this.props.value;
    if (all_selected.includes(selected_index)) {
      all_selected = all_selected.filter(item => item !== selected_index);
    } else {
      all_selected.push(selected_index);
    }
    this.props.handleChange(all_selected);
  }
  render() {
      return (<div className="input_checkbox_group">
        {this.props.choices.map((item, index) => {
          return <div className={classNames("checkbox_item", {
            "selected": this.props.value.includes(index)
          })} onClick={this.handleChange.bind(this, index)} key={index}>
            <div className="checkbox">
              <svg class="check" viewBox="-10 -10 20 20">
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

export default CheckboxGroupInput;