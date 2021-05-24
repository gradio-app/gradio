import React from 'react';
import ComponentExample from '../component_example';

class AudioOutput extends React.Component {
  constructor(props) {
    super(props);
    this.src = null;
    this.key = 0; // needed to prevent audio caching
  }
  render() {
    if (this.props.value !== this.src) {
      this.key += 1;
      this.src = this.props.value;
    }
    return this.props.value ? <div className="output_audio">
      <audio controls key={this.key}>
        <source src={this.props.value}></source>
      </audio>
    </div> : false;
  }
}

class AudioOutputExample extends ComponentExample {
  render() {
    return <div className="output_audio_example">{this.props.value}</div>
  }
}

export {AudioOutput, AudioOutputExample};
