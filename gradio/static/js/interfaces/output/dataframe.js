const dataframe_output = {
  html: `
    <div class="dataframe"></div>
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
  }
}
