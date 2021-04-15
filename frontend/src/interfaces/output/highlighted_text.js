const highlighted_text = {
  html: `
    <div class="highlight_legend">
      <div class="color_legend hidden">
        <span>-1</span>
        <span>0</span>
        <span>+1</span>
      </div>
      <div class="category_legend hidden"></div>
    </div>
    <div class="output_text"></div>
  `,
  init: function(opts) {
    this.color_map = {};
    if (opts.color_map) {
      this.generate_category_legend(opts.color_map);
    }
  },
  new_category_index: 0,
  generate_category_legend: function(map) {
    let default_colors = ["pink", "lightblue", "gold", "plum", "lightskyblue", "greenyellow", "khaki", "cyan", "moccasin", "lightgray"]
    for (let category in map) {
      if (category in this.color_map) {
        continue;
      }
      let color = map[category];
      if (!color) {
        if (this.new_category_index < default_colors.length) {
          color = default_colors[this.new_category_index];
          this.new_category_index++;
        } else {
          function randInt(min, max) {
            return Math.floor(Math.random() * (max- min) + min);
          }
          color = "rgb(" + randInt(128, 240) + ", " + randInt(128, 240) + ", " + randInt(128, 240) + ")" 
        }
      }
      this.color_map[category] = color;
      this.target.find(".category_legend").append(`
        <div class="category-label">
          <div style="background-color:${color}">&nbsp;</div> 
          ${category}
        </div>
      `)
    }
  },
  output: function(data) {
    if (data.length == 0) {
      return;
    } else if (typeof(data[0][1]) == "string") {
      this.target.find(".category_legend").removeClass("hidden");
      let new_color_map = {};
      for (let span of data) {
        let category = span[1];
        if (category != null) {
          new_color_map[category] = null;
        }
      }
      this.generate_category_legend(new_color_map);
      let html = "";
      for (let span of data) {
        let category = span[1];
        let color = category == null ? "white" : this.color_map[category];
        html += `<span title="${category}" style="background-color: ${color}">${span[0]}</span>`
      }
      this.target.find(".output_text").html(html);

    } else {
      this.target.find(".color_legend").removeClass("hidden");
      let html = "";
      for (let span of data) {
        let value = span[1];
        let color = "";
        if (value < 0) {
          color = "8,241,255," + (-value);
        } else {
          color = "230,126,34," + value;
        }
        html += `<span title="${value}" style="background-color: rgba(${color})">${span[0]}</span>`
      }
      this.target.find(".output_text").html(html);
    }
  },
  submit: function() {
  },
  clear: function() {
    this.target.find(".output_text").empty();
    this.target.find(".highlight_legend div").addClass("hidden");
  },
  load_example_preview: function(data) {
    let output_string = "";
    for (const [text, type] of data) {
      output_string += text;
    }
    if (output_string.length > 20) {
      return output_string.substring(0,20) + "...";
    }
    return data;
  },
}
