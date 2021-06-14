import React from 'react';
import ComponentExample from '../component_example';
import classNames from "classnames";
import { getSaliencyColor } from '../utils';

class DropdownInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(selected_item) {
    this.props.handleChange(selected_item);
  }
  render() {
    return (<div className="input_dropdown">
      {this.props.interpretation === null ?
        <div className="dropdown inline-block relative">
          <button className="selector ">
            <span className="current">{this.props.value}</span>
            <svg className="caret" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /> </svg>
          </button>
          <ul className="dropdown_menu">
            {this.props.choices.map((item, index) => {
              return <li className={classNames("dropdown_item", {
                "selected": item === this.props.value
              })} onClick={this.handleChange.bind(this, item)} key={index}>
                {item}
              </li>
            })}
          </ul>
        </div>
        :
        <div class="interpretation">
          {this.props.interpretation.map((value, index) =>
            <div class="interpretation_box" key={index} style={{ "backgroundColor": getSaliencyColor(value) }}>{this.props.choices[index]}</div>
          )}
        </div>}
    </div>)
  }
}

class DropdownInputExample extends ComponentExample {
  render() {
    return <div className="input_dropdown_example">{this.props.value}</div>
  }
}

export { DropdownInput, DropdownInputExample };
