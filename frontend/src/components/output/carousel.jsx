import React from "react";
import BaseComponent from "../base_component";
import ComponentExample from "../component_example";
import { output_component_map } from "../../components";

class CarouselOutput extends BaseComponent {
  constructor(props) {
    super(props);
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.state = { carousel_index: 0 };
  }
  previous() {
    this.setState({
      carousel_index:
        (this.state.carousel_index - 1 + this.props.value.length) %
        this.props.value.length,
    });
  }
  next() {
    this.setState({
      carousel_index:
        (this.state.carousel_index + 1 + this.props.value.length) %
        this.props.value.length,
    });
  }
  render() {
    if (this.props.value === null) {
      if (this.state.carousel_index !== 0) {
        this.setState({ carousel_index: 0 });
      }
      return false;
    } else {
      return (
        <div className="output_carousel">
          {this.props.components.map((config, index) => {
            let Component = output_component_map[config.name][0];
            return (
              <div className="component" key={index}>
                {config.label ? (
                  <div className="panel_header">{config.label}</div>
                ) : (
                  false
                )}
                <Component
                  {...config}
                  value={this.props.value[this.state.carousel_index][index]}
                  key={index}
                />
              </div>
            );
          })}
          <div className="carousel_control">
            <button onClick={this.previous}>
              <svg width="30" height="30">
                <path
                  transform="translate(2,2) rotate(270, 15, 15)"
                  stroke="none"
                  fill="black"
                  d="M12.401923788647 5.0096189432334a3 3 0 0 1 5.1961524227066 0l9.8038475772934 16.980762113533a3 3 0 0 1 -2.5980762113533 4.5l-19.607695154587 0a3 3 0 0 1 -2.5980762113533 -4.5"
                ></path>
              </svg>
            </button>
            <div className="carousel_index">
              {this.state.carousel_index + 1} / {this.props.value.length}
            </div>
            <button onClick={this.next}>
              <svg width="30" height="30">
                <path
                  transform="translate(2,2) rotate(90, 15, 15)"
                  stroke="none"
                  fill="black"
                  d="M12.401923788647 5.0096189432334a3 3 0 0 1 5.1961524227066 0l9.8038475772934 16.980762113533a3 3 0 0 1 -2.5980762113533 4.5l-19.607695154587 0a3 3 0 0 1 -2.5980762113533 -4.5"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      );
    }
  }
  static load_example_preview(data) {
    if (data.length > 20) {
      return data.substring(0, 20) + "...";
    }
    return data;
  }
}

class CarouselOutputExample extends ComponentExample {
  render() {
    return <div className="output_carousel_example">...</div>;
  }
}

export { CarouselOutput, CarouselOutputExample };
