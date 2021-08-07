import React from "react";
import BaseComponent from "../base_component";
import ComponentExample from "../component_example";
import classNames from "classnames";
import { array_compare } from "../../utils";

class DataframeOutput extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = this.constructor.get_default_state();
  }
  static get_default_state() {
    return {
      page: 0,
      sort_by: null,
      sort_descending: false
    };
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      prevState.data === undefined ||
      !array_compare(nextProps.value.data, prevState.data)
    ) {
      let new_state = DataframeOutput.get_default_state();
      new_state["data"] = nextProps.value.data;
      return new_state;
    }
    return null;
  }
  set_page(page) {
    this.setState({ page: page });
  }
  sort_table(col_index) {
    if (this.state.sort_by === col_index) {
      this.setState({ sort_descending: !this.state.sort_descending, page: 0 });
    } else {
      this.setState({ sort_by: col_index, sort_descending: false, page: 0 });
    }
  }
  render() {
    if (this.props.value.data.length === 0) {
      return null;
    }
    let headers = this.props.headers || this.props.value.headers;
    let row_count = this.props.value.data.length;
    let col_count = this.props.value.data[0].length;
    let selected_data = this.props.value.data.slice();
    if (this.state.sort_by !== null) {
      selected_data.sort(
        (function (index) {
          return function (a, b) {
            return a[index] === b[index] ? 0 : a[index] < b[index] ? -1 : 1;
          };
        })(this.state.sort_by)
      );
      if (this.state.sort_descending) {
        selected_data.reverse();
      }
    }
    let visible_pages = null;
    if (this.props.max_rows !== null && row_count > this.props.max_rows) {
      if (this.props.overflow_row_behaviour === "paginate") {
        selected_data = selected_data.slice(
          this.state.page * this.props.max_rows,
          (this.state.page + 1) * this.props.max_rows
        );
        let page_count = Math.ceil(row_count / this.props.max_rows);
        visible_pages = [];
        [0, this.state.page, page_count - 1].forEach((anchor) => {
          for (let i = anchor - 2; i <= anchor + 2; i++) {
            if (i >= 0 && i < page_count && !visible_pages.includes(i)) {
              if (
                visible_pages.length > 0 &&
                i - visible_pages[visible_pages.length - 1] > 1
              ) {
                visible_pages.push(null);
              }
              visible_pages.push(i);
            }
          }
        });
      } else {
        selected_data = selected_data
          .slice(0, Math.ceil(this.props.max_rows / 2))
          .concat(
            [Array(col_count).fill("...")],
            selected_data.slice(row_count - Math.floor(this.props.max_rows / 2))
          );
      }
    }
    if (this.props.max_cols !== null && col_count > this.props.max_cols) {
      let [hidden_col_start, hidden_col_end] = [
        Math.ceil(this.props.max_cols / 2),
        col_count - Math.floor(this.props.max_cols / 2) - 1
      ];
      headers =
        headers.slice(0, hidden_col_start) +
        ["..."] +
        headers.slice(hidden_col_end);
      selected_data = selected_data.map(
        (row) =>
          row.slice(0, hidden_col_start) + ["..."] + row.slice(hidden_col_end)
      );
    }
    return (
      <div className="output_dataframe">
        <table>
          {headers ? (
            <thead>
              {headers.map((header, i) => (
                <th key={i} onClick={this.sort_table.bind(this, i)}>
                  {header}
                  {this.state.sort_by === i
                    ? this.state.sort_descending
                      ? "⇧"
                      : "⇩"
                    : false}
                </th>
              ))}
            </thead>
          ) : (
            false
          )}
          <tbody>
            {selected_data.map((row) => {
              return (
                <tr>
                  {row.map((cell) => (
                    <td>{cell}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {visible_pages !== null ? (
          <div className="pages">
            Pages:{" "}
            {visible_pages.map((page) =>
              page === null ? (
                <div>...</div>
              ) : (
                <button
                  className={classNames("page", {
                    selected: page === this.state.page
                  })}
                  key={page}
                  onClick={this.set_page.bind(this, page)}
                >
                  {page + 1}
                </button>
              )
            )}
          </div>
        ) : (
          false
        )}
      </div>
    );
  }
}

class DataframeOutputExample extends ComponentExample {
  render() {
    let data_copy = [];
    for (let row of this.props.value.slice(0, 3)) {
      let new_row = row.slice(0, 3);
      if (row.length > 3) {
        new_row.push("...");
      }
      data_copy.push(new_row);
    }
    if (this.props.value.length > 3) {
      let new_row = Array(data_copy[0].length).fill("...");
      data_copy.push(new_row);
    }
    return (
      <table className="input_dataframe_example">
        <tbody>
          {data_copy.map((row) => {
            return (
              <tr>
                {row.map((cell) => {
                  return <td>{cell}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }
}

export { DataframeOutput, DataframeOutputExample };
