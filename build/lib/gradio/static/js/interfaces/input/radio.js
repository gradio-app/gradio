const radio = {
  html: ``,
  init: function(opts) {
    this.choices = opts.choices;
    html = "<div class='radio_group'>"
    for ([index, choice] of opts.choices.entries()) {
      html += `
        <label for="${this.id}_${index}">
          <input id="${this.id}_${index}" type="radio" name="${this.id}" value="${index}">
          ${choice}
        </label>
      `;
    }
    html += "</div>"
    this.target.html(html);
    this.target.find("input").checkboxradio();
    this.target.find("label:first-child input").prop("checked", true);    
    this.target.find("input").button("refresh");  
  },
  submit: function() {
    checked_val = this.target.find("input:checked").val();
    this.io_master.input(this.id, this.choices[checked_val]);
  },
  show_interpretation: function(data) {
    this.target.find(".interpret_check").remove();
    let alternate_index = 0;
    for (let i = 0; i < data.length; i++) {
      let score = data[i];
      if (score == null) {
        var html = `<div class='interpret_check interpret_select'>
            &#x2713;
          </div>`
      } else {
        var html = `<div class='interpret_check alternate'
            alternate_index=${alternate_index}
            style='background-color: ${getSaliencyColor(data[i])}'>
            &#x2713;
          </div>`;
        alternate_index++;
      }
      this.target.find("label").eq(i).append(html);
    }
  },
  interpretation_logic: "Highlights the result of the alternative selection to radio. Hover to see alternative output.",
  clear: function() {
    this.target.find(".interpretation").empty();    
    this.target.find("input").prop("checked", false);    
    this.target.find("label:first-child input").prop("checked", true);    
    this.target.find("input").button("refresh");  
  },
  load_example: function(data) {
    let child = this.choices.indexOf(data) + 1;
    this.target.find("label:nth-child("+child+") input").prop("checked", true);
    this.target.find("input").button("refresh");  
  }
}
