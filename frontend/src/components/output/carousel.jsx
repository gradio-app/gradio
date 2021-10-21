import React from "react";
import BaseComponent from "../base_component";
import ComponentExample from "../component_example";
import { output_component_set } from "../../components";
import arrowRight from "../../static/img/arrow-right.svg";
import arrowLeft from "../../static/img/arrow-left.svg";

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
        this.props.value.length
    });
  }
  next() {
    this.setState({
      carousel_index:
        (this.state.carousel_index + 1 + this.props.value.length) %
        this.props.value.length
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
            let Component = output_component_set.find(
              (c) => c.name === config.name
            ).memoized_component;
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
              <img src={arrowLeft} />
            </button>
            <div className="carousel_index">
              {this.state.carousel_index + 1} / {this.props.value.length}
            </div>
            <button onClick={this.next}>
              <img src={arrowRight} />
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
