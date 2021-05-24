import React from 'react';
import { DataURLComponentExample } from '../component_example';
import AudioReactRecorder, { RecordState } from 'audio-react-recorder'

class AudioInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recordState: RecordState.STOP
    }
    this.src = null;
    this.key = 0; // needed to prevent audio caching
  }
  start = () => {
    this.setState({
      recordState: RecordState.START
    })
  }
  stop = () => {
    this.setState({
      recordState: RecordState.STOP
    })
  }
  onStop = (audioData) => {
    let reader = new FileReader();
    reader.onload = (function (e) { this.props.handleChange(e.target.result) }).bind(this);
    reader.readAsDataURL(audioData.blob);
  }
  render() {
    if (this.props.value !== null) {
      if (this.props.value !== this.src) {
        this.key += 1;
        this.src = this.props.value;
      }
      return (<div className="input_audio">
        <audio controls key={this.key}>
          <source src={this.props.value}></source>
        </audio>
      </div>);
    } else {
      return (<div className="input_audio">
        <AudioReactRecorder state={this.state.recordState} onStop={this.onStop} />
        {this.state.recordState === RecordState.STOP ?
          <button className="start" onClick={this.start}>Record</button> :
          <button className="stop" onClick={this.stop}>Recording...</button>
        }
      </div>);
    }
  }
}

class AudioInputExample extends DataURLComponentExample {
  render() {
    return <div className="input_audio_example">{this.props.value}</div>
  }
}

export { AudioInput, AudioInputExample };
