import React from 'react';
import AudioReactRecorder, { RecordState } from 'audio-react-recorder'

class AudioInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recordState: RecordState.STOP
    }
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
    return <div className="input_audio">
      {this.props.value ?
        <audio controls>
          <source src={this.props.value}></source>
        </audio>
        :
        <>
          <AudioReactRecorder state={this.state.recordState} onStop={this.onStop} />
          {this.state.recordState == RecordState.STOP ?
            <button class="start" onClick={this.start}>Record</button> :
            <button class="stop" onClick={this.stop}>Recording...</button>
          }
        </>
      }
    </div>
  }
}

export default AudioInput;
