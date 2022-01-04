import React from "react";
import BaseComponent from "../base_component";
import ComponentExample from "../component_example";
import { output_component_set } from "../../components";

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
              <svg class="caret" viewBox="0 0 9.1457395 15.999842">
                <path d="M 0.32506616,7.2360106 7.1796187,0.33129769 c 0.4360247,-0.439451 1.1455702,-0.442056 1.5845974,-0.0058 0.4390612,0.435849 0.441666,1.14535901 0.00582,1.58438501 l -6.064985,6.1096644 6.10968,6.0646309 c 0.4390618,0.436026 0.4416664,1.145465 0.00582,1.584526 -0.4358485,0.439239 -1.1453586,0.441843 -1.5845975,0.0058 L 0.33088256,8.8203249 C 0.11135166,8.6022941 0.00105996,8.3161928 7.554975e-6,8.0295489 -0.00104244,7.7427633 0.10735446,7.4556467 0.32524356,7.2361162" />
              </svg>
            </button>
            <div className="carousel_index">
              {this.state.carousel_index + 1} / {this.props.value.length}
            </div>
            <button onClick={this.next}>
              <svg
                class="caret"
                viewBox="0 0 9.1457395 15.999842"
                transform="scale(-1, 1)"
              >
                <path d="M 0.32506616,7.2360106 7.1796187,0.33129769 c 0.4360247,-0.439451 1.1455702,-0.442056 1.5845974,-0.0058 0.4390612,0.435849 0.441666,1.14535901 0.00582,1.58438501 l -6.064985,6.1096644 6.10968,6.0646309 c 0.4390618,0.436026 0.4416664,1.145465 0.00582,1.584526 -0.4358485,0.439239 -1.1453586,0.441843 -1.5845975,0.0058 L 0.33088256,8.8203249 C 0.11135166,8.6022941 0.00105996,8.3161928 7.554975e-6,8.0295489 -0.00104244,7.7427633 0.10735446,7.4556467 0.32524356,7.2361162" />
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
