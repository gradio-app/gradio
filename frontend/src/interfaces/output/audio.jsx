import React from 'react';

class AudioOutput extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return this.props.value ? <div className="output_audio">
      <audio controls>
        <source src={this.props.value}></source>
      </audio>
    </div> : false;
  }
}

export default AudioOutput;
