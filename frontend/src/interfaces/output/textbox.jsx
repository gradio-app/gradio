import React from 'react';

class TextboxOutput extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <div className="output_text">{this.props.value || <span>&nbsp;</span>}</div>
  }
  static load_example_preview(data) {
    if (data.length > 20) {
      return data.substring(0,20) + "...";
    }
    return data;
  }  
}

export default TextboxOutput;
