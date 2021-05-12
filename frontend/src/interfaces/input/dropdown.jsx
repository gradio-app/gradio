import React from 'react';
import classNames from "classnames";

class DropdownInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(selected_index) {
    this.props.handleChange(selected_index);
  }
  render() {
    return (<div className="input_dropdown">
      <div class="dropdown inline-block relative">
        <button class="selector ">
          <span class="current">{this.props.value == null ? "- Select -" : this.props.choices[this.props.value]}</span>
          <svg class="caret" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /> </svg>
        </button>
        <ul class="dropdown_menu">
          {this.props.choices.map((item, index) => {
            return <li className={classNames("dropdown_item", {
              "selected": index == this.props.value
            })} onClick={this.handleChange.bind(this, index)} key={index}>
              {item}
            </li>
          })}
        </ul>
      </div>
    </div>)
  }
}

export default DropdownInput;