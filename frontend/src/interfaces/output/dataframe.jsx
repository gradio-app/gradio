import React from 'react';
import ComponentExample from '../component_example';
import jspreadsheet from "jspreadsheet-ce";

class DataframeOutput extends React.Component {
  constructor(props) {
    super(props);
    this.wrapper = React.createRef();
  }
  componentDidMount = function() {
    this.el = jspreadsheet(this.wrapper.current);
  }
  render() {
    if (this.props.value == null) {
      return false;
    }
    if (this.props.value.headers) {
      for (let [i, header] of this.props.value.headers.entries())
      this.el.setHeader(i, header);
    }
    this.el.setData(this.props.value.data);
    return (
    <div className="output_dataframe">
      <div ref={this.wrapper} />
    </div>)
  }
}

class DataframeOutputExample extends ComponentExample {
  render() {
    let data_copy = [];
    for (let row of this.props.value.slice(0, 3)) {
      let new_row = row.slice(0, 3)
      if (row.length > 3) {
        new_row.push("...");
      }
      data_copy.push(new_row);
    }
    if (this.props.value.length > 3) {
      let new_row = Array(data_copy[0].length).fill("...");
      data_copy.push(new_row);
    }
    return <table className="input_dataframe_example">
      <tbody>
        {data_copy.map(row => {
          return <tr>
            {row.map(cell => {
              return <td>{cell}</td>
            })}
          </tr>
        })}
      </tbody>
    </table>
  }
}

export {DataframeOutput, DataframeOutputExample};
