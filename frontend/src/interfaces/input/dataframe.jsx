import React from 'react';
import ComponentExample from '../component_example';
import jspreadsheet from "jspreadsheet-ce";

class DataframeInput extends React.Component {
  constructor(props) {
    super(props);
    this.wrapper = React.createRef();
    this.handleChange = this.handleChange.bind(this);
    this.getEmptyArray = this.getEmptyArray.bind(this);
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
        if (this.opts.datatype) {
          let datatype = typeof this.opts.datatype === "string" ? this.opts.datatype : this.opts.datatype[i];
          let datatype_map = { "str": "text", "bool": "checkbox", "number": "numeric", "date": "calendar" }
          column.type = datatype_map[datatype];
        }
        if (this.opts.headers) {
          column.title = this.opts.headers[i];
        }
        column_config.push(column);
      }
      config.columns = column_config;
    }
    config.data = this.props.value;
    return config;
  }
  render() {
    if (JSON.stringify(this.props.value) !== JSON.stringify(this.data)) {
      this.el.setData(this.props.value);
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
