const dataframe_output = {
  html: `
    <div class="interface_max_box">
      <div class="dataframe"></div>
    </div>
  `,
  init: function(opts) {
  },
  output: function(data) {
    let config = {data: data.data};
    if (data.headers) {
      let column_config = [];
      for (let header of data.headers) {
        column_config.push({title: header});
      }
      config.columns = column_config;
    }
    if (this.table) {
      this.clear();
    }
    this.table = this.target.find(".dataframe").jexcel(config);
  },
  clear: function() {
    jexcel.destroy(this.target.find(".dataframe")[0]);
    this.table = null;
  },
  load_example: function(data) {
    this.output({"data": data});
  },
  load_example_preview: function(data) {
    data = JSON.parse(JSON.stringify(data))
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
}
