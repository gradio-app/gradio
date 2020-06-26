const key_values = {
  html: `
    <table class="key_values">
      <thead>
        <th>Property</th>
        <th>Value</th>
      </thead>
      <tbody></tbody>
    </table>
    `,
  init: function(opts) {},
  output: function(data) {
    let html = ""
    for (let row of data) {
      html += `<tr>
        <td>${row[0]}</td>
        <td>${row[1]}</td>
      </tr>`;
    }
    this.target.find("tbody").html(html);
  },
  clear: function() {
    this.target.find("tbody").empty();
  }
}
