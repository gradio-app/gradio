import React from "react";
import BaseComponent from "../base_component";
import ComponentExample from "../component_example";
import { getNextColor } from "../../utils";

class HighlightedTextOutput extends BaseComponent {
  constructor(props) {
    super(props);
    this.color_map = this.props.color_map || {};
    this.new_category_index = 0;
  }
  generate_category_legend(category_map) {
    for (let category in category_map) {
      if (category in this.color_map) {
        continue;
      }
      let color = category_map[category];
      if (!color) {
        color = getNextColor(this.new_category_index)
        this.new_category_index++;
      }
      this.color_map[category] = color;
    }
  }
  render() {
    if (this.props.value === null || this.props.value.length === 0) {
      return false;
    }
    let first_score = this.props.value[0][1];
    if (first_score === null || typeof first_score === "string") {
      let new_color_map = {};
      for (let span of this.props.value) {
        let category = span[1];
        if (category != null) {
          new_color_map[category] = null;
        }
      }
      this.generate_category_legend(new_color_map);
      return (
        <div className="output_highlightedtext">
          <div className="category_legend">
            {Object.entries(this.color_map).map(([category, color]) => {
              return (
                <div className="category-label">
                  <div
                    className="colorbox"
                    style={{ "background-color": color }}
                  >
                    &nbsp;
                  </div>
                  {category}
                </div>
              );
            })}
          </div>
          <div className="output_text">
            {this.props.value.map((span) => {
              let category = span[1];
              let color = category == null ? "white" : this.color_map[category];
              return (
                <span title={category} style={{ "background-color": color }}>
                  {span[0]}
                </span>
              );
            })}
          </div>
        </div>
      );
    } else {
      return (
        <div className="output_highlightedtext">
          <div className="color_legend">
            <span>-1</span>
            <span>0</span>
            <span>+1</span>
          </div>
          <div className="output_text">
            {this.props.value.map((text, value) => {
              let color = "";
              if (value < 0) {
                color = "8,241,255," + -value;
              } else {
                color = "230,126,34," + value;
              }
              return (
                <span
                  title={value}
                  style={{ "background-color": `rgba{${color}}` }}
                >
                  {text}
                </span>
              );
            })}
          </div>
        </div>
      );
    }
  }
}

class HighlightedTextOutputExample extends ComponentExample {
  render() {
    let output_string = "";
    for (const span of this.props.value) {
      output_string += span[0];
    }
    if (output_string.length > 20) {
      output_string = output_string.substring(0, 20) + "...";
    }
    return (
      <div className="output_highlighted_text_example">{output_string}</div>
    );
  }
}

export { HighlightedTextOutput, HighlightedTextOutputExample };
