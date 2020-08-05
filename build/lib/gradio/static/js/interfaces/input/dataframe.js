const dataframe_input = {
  html: `
    <div class="dataframe">
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
    let config = {data: data};
    if (opts.headers || opts.datatype) {
      let column_config = [];
      for (let i = 0; i < col_count; i++) {
        let column = {};
        if (opts.datatype) {
          let datatype = typeof opts.datatype === "string" ? opts.datatype : opts.datatype[i];
          let datatype_map = {"str": "text", "bool": "checkbox", "number": "numeric", "date": "calendar"}
          column.type = datatype_map[datatype];
        }
        if (opts.headers) {
          column.title = opts.headers[i];
        }
        column_config.push(column);
      }
      config.columns = column_config;
    }
    this.config = config;
    this.table = this.target.find(".dataframe").jexcel(config);
  },
  submit: function() {
    let data = this.table.getData();
    if (this.datatype) {
      for (let i = 0; i < data[0].length; i++) {
        if (this.datatype == "number" || (i < this.datatype.length && this.datatype[i].type == "number")) {
          for (let j = 0; j < data.length; j++) {
            let val = data[j][i];
            data[j][i] = val == "" ? 0 : parseFloat(val);
          }
        }
      }
    }
    this.io_master.input(this.id, data);
  },
  clear: function() {
  }
}
