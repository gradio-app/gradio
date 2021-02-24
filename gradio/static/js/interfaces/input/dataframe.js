const dataframe_input = {
  html: `
    <div class="interface_max_box">
      <div class="dataframe">
      </div>
    </div>
    `,
  init: function(opts) {
    let row_count = opts.row_count;
    let col_count = opts.col_count;
    this.datatype = opts.datatype;
    let data = [];
    for (let i = 0; i < row_count; i++) {
      let row = []
      for (let j = 0; j < col_count; j++) {
        row.push(null);
      }
      data.push(row);
    }
    this.default_data = data;
    this.opts = opts;
    this.reset(this.default_data);
  },
  reset: function(data) {
    if (this.table) {
      this.table.destroy();
    }
    row_count = data.length;
    col_count = data[0].length;
    config = {};
    if (this.opts.headers || this.opts.datatype) {
      let column_config = [];
      for (let i = 0; i < col_count; i++) {
        let column = {};
        if (this.opts.datatype) {
          let datatype = typeof this.opts.datatype === "string" ? this.opts.datatype : this.opts.datatype[i];
          let datatype_map = {"str": "text", "bool": "checkbox", "number": "numeric", "date": "calendar"}
          column.type = datatype_map[datatype];
        }
        if (this.opts.headers) {
          column.title = this.opts.headers[i];
        }
        column_config.push(column);
      }
      config.columns = column_config;
    }
    config.data = data;
    this.table = this.target.find(".dataframe").jexcel(config);
  },
  submit: function() {
    let data = this.table.getData();
    if (this.datatype) {
      for (let i = 0; i < data[0].length; i++) {
        if (this.datatype == "number" || (i < this.datatype.length && this.datatype[i] == "number")) {
          for (let j = 0; j < data.length; j++) {
            let val = data[j][i];
            data[j][i] = val == "" ? 0 : parseFloat(val);
          }
        }
      }
    }
    this.io_master.input(this.id, data);
  },
  show_interpretation: function(data) {
    this.target.find("td").css("background-color", "white")
    let cell_name = (i, j) => {
      let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let column_name = letters[i % 26];
      if (i >= 26) {
        column_name = letters[Math.floor(i / 26) - 1] + column_name;
      }
      return column_name + (j + 1);
    }
    for (let [j, row] of data.entries()) {
      for (let [i, value] of row.entries()) {
        console.log(cell_name(i, j), value);
        this.table.setStyle(cell_name(i, j), 'background-color', getSaliencyColor(value));
      }
    }
  },
  interpretation_logic: "Highlights the output contribution of each cell in dataframe.",
  load_example_preview: function(data) {
    let data_copy = [];
    for (let row of data.slice(0,3)) {
      new_row = row.slice(0,3)
      if (row.length > 3) {
        new_row.push("...");
      }
      data_copy.push(new_row);      
    }
    if (data.length > 3) {
      new_row = Array(data_copy[0].length).fill("...");
      data_copy.push(new_row);      
    }
    let html = "<table><tbody>"
    for (let row of data_copy) {
      html += "<tr>";
      for (let cell of row) {
        html += "<td>" + cell + "</td>";
      }
      html += "</tr>";
    }
    html += "</tbody></table>";
    return html;
  },
  load_example: function(data) {
    this.reset(data);
  },
  clear: function() {
    this.reset(this.default_data);
    this.target.find("td").css("background-color", "white");
  }
}
