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
        color = getNextColor(this.new_category_index);
        this.new_category_index++;
      }
      this.color_map[category] = color;
    }
  }
  render() {
    if (this.props.value === null || this.props.value.length === 0) {
      return false;
    }
    let first_score = null;
    for (let span of this.props.value) {
      if (span[1] !== null) {
        first_score = span[1];
        break;
      }
    }
    if (typeof first_score === "string") {
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
          {this.props.show_legend ? <div className="category_legend">
            {Object.entries(this.color_map).map(([category, color]) => {
              return (
                <div className="category-label" style={{ "background-color": color }}>
                  {category}
                </div>
              );
            })}
          </div>
            : false}
          <div className="textfield">
            {this.props.value.map((span) => {
              let category = span[1];
              let style = {};
              if (category !== null) {
                style["color"] = this.color_map[category];
                style["backgroundColor"] = style.color.replace("1)", "var(--tw-bg-opacity))");
              }
              return (
                <span class="textspan" title={category} style={style}>
                  <span class="text">{span[0]}</span>
                  {this.props.show_legend || span[1] === null ? false :
                    <span class="inline_label" style={{ backgroundColor: style.color }}>
                      {span[1]}
                    </span>
                  }
                </span>
              );
            })}
          </div>
        </div>
      );
    } else {
      return (
        <div className="output_highlightedtext">
          {this.props.show_legend ?
            <div className="color_legend">
              <span>-1</span>
              <span>0</span>
              <span>+1</span>
            </div> : false}
          <div className="textfield">
            {this.props.value.map(span => {
              let [text, value] = span;
              let color = "";
              if (value < 0) {
                color = "141, 131, 214," + -value;
              } else {
                color = "235, 77, 75," + value;
              }
              return (
                <span class="textspan" title={value} style={{ "backgroundColor": `rgba(${color})` }}>
                  <span class="text">{text}</span>
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
