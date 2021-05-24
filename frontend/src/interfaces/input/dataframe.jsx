import React from 'react';
import ComponentExample from '../component_example';
import jspreadsheet from "jspreadsheet-ce";
import "../../../node_modules/jspreadsheet-ce/dist/jspreadsheet.css"

class DataframeInput extends React.Component {
  constructor(props) {
    super(props);
    this.wrapper = React.createRef();
    this.handleChange = this.handleChange.bind(this);
    this.getConfig = this.getConfig.bind(this);
  }
  componentDidMount = function () {
    this.el = jspreadsheet(this.wrapper.current, this.getConfig());
    this.el.onchange = this.handle_change;
  }
  handleChange(data) {
    this.props.handleChange(data);
  }
  getConfig() {
    let col_count = this.props.col_count;
    let config = {};
    if (this.props.headers || this.props.datatype) {
      let column_config = [];
      for (let i = 0; i < col_count; i++) {
        let column = {};
        if (this.props.datatype) {
          let datatype = typeof this.props.datatype === "string" ? this.props.datatype : this.props.datatype[i];
          let datatype_map = { "str": "text", "bool": "checkbox", "number": "numeric", "date": "calendar" }
          column.type = datatype_map[datatype];
        }
        if (this.props.headers) {
          column.title = this.props.headers[i];
        }
        column_config.push(column);
      }
      config.columns = column_config;
    }
    config.data = this.props.value;
    return config;
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
    if (JSON.stringify(this.props.value) !== JSON.stringify(this.data) && this.el) {
      this.resetData(this.props.value);
      this.data = this.props.value;
    }
    return (
      <div className="input_dataframe">
        <div ref={this.wrapper} />
      </div>)
  }
}

class DataframeInputExample extends ComponentExample {
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

export { DataframeInput, DataframeInputExample };
