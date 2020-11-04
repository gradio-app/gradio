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
    for (const [key, value] of data) {
      html += `<tr>
        <td>${key}</td>
        <td>${value}</td>
      </tr>`;
    }
    this.target.find("tbody").html(html);
  },
  clear: function() {
    this.target.find("tbody").empty();
  },
  load_example_preview: function(data) {
    let html_preview = "";
    for (const [key, value] of data.slice(0,3)) {
      html_preview += key + ": " + value + "<br>"
    }
    if (data.length > 3) {
      html_preview += "..."
    }
    return html_preview;
  },
}
