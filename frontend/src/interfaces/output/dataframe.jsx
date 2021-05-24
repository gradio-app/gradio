import React from 'react';
import ComponentExample from '../component_example';
import jspreadsheet from "jspreadsheet-ce";
import "../../../node_modules/jspreadsheet-ce/dist/jspreadsheet.css"
import classNames from 'classnames';

class DataframeOutput extends React.Component {
  constructor(props) {
    super(props);
    this.wrapper = React.createRef();
  }
  componentDidMount = function() {
    this.el = jspreadsheet(this.wrapper.current, {minDimensions: [1, 1]});
  }
  resetData(new_data) {
    let [new_rows, new_cols] = [new_data.length, new_data[0].length];
    let current_data = this.el.getData();
    let [cur_rows, cur_cols] = [current_data.length, current_data[0].length];
    if (cur_rows < new_rows) {
      this.el.insertRow(new_rows - cur_rows);
    } else if (cur_rows > new_rows) {
      this.el.deleteRow(0, cur_rows - new_rows);
    }
    if (cur_cols < new_cols) {
      this.el.insertColumn(new_cols - cur_cols);
    } else if (cur_cols > new_cols) {
      this.el.deleteColumn(0, cur_cols - new_cols);
    }
    this.el.setData(new_data);
  }
  render() {
    if (this.props.value && this.props.value.headers && this.el) {
      for (let [i, header] of this.props.value.headers.entries())
      this.el.setHeader(i, header);
    }
    if (this.props.value && this.el) {
      this.resetData(this.props.value.data)
    }
    return (
    <div className={classNames("output_dataframe", {"hidden": this.props.value === null})}>
      <div ref={this.wrapper}/>
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
