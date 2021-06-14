import React from 'react';
import { DataURLComponentExample } from '../component_example';
import Webcam from "react-webcam";
import { SketchField, Tools } from '../../vendor/ReactSketch';
import { getObjectFitSize, paintSaliency } from '../utils';

class ImageInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.uploader = React.createRef();
    this.openFileUpload = this.openFileUpload.bind(this);
    this.onImgLoad = this.onImgLoad.bind(this);
    this.load_preview_from_files = this.load_preview_from_files.bind(this);
    this.load_preview_from_upload = this.load_preview_from_upload.bind(this);
    this.load_preview_from_drop = this.load_preview_from_drop.bind(this);
    this.snapshot = this.snapshot.bind(this);
    this.getSketch = this.getSketch.bind(this);
    this.imgRef = React.createRef();
    this.webcamRef = React.createRef();
    this.sketchRef = React.createRef();
    this.sketchKey = 0;
  }
  handleChange(data) {
    this.props.handleChange(data);
  }
  openFileUpload() {
    this.uploader.current.click();
  }
  snapshot() {
    let imageSrc = this.webcamRef.current.getScreenshot();
    this.handleChange(imageSrc);
  }
  getSketch() {
    let imageSrc = this.sketchRef.current.toDataURL();
    this.handleChange(imageSrc);
  }
  onImgLoad({target:img}) {
    this.setState({dimensions:{height:img.offsetHeight,
                               width:img.offsetWidth}});
  }  
  render() {
    let no_action = (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
    }
    if (this.props.value !== null && this.props.source !== "canvas") {
      let interpretation = false;
      if (this.props.interpretation !== null) {
        let img = this.imgRef.current;
        let size = getObjectFitSize(true, img.width, img.height, img.naturalWidth, img.naturalHeight);
        if (this.props.shape) {
          size = getObjectFitSize(true, size.width, size.height, this.props.shape[0], this.props.shape[1])
        }
        let width = size.width;
        let height = size.height;
        let canvas = document.createElement("canvas")
        canvas.setAttribute("height", height);
        canvas.setAttribute("width", width);
        paintSaliency(this.props.interpretation, canvas.getContext("2d"), width, height);
        interpretation = (<div class="interpretation">
          <img src={canvas.toDataURL()}></img>
        </div>)
      }
      return (
        <div className="input_image">
          <div className="image_preview_holder">
            <img ref={this.imgRef} onLoad={this.onImgLoad} className="image_preview" alt="" src={this.props.value} />
          </div>
          {interpretation}
        </div>)
    } else {
      if (this.props.source === "upload") {
        return (
          <div className="input_image" onDrag={no_action} onDragStart={no_action} onDragEnd={no_action} onDragOver={no_action} onDragEnter={no_action} onDragLeave={no_action} onDrop={no_action} >
            <div className="upload_zone" onClick={this.openFileUpload} onDrop={this.load_preview_from_drop}>
              Drop Image Here<br />- or -<br />Click to Upload
            </div>
            <input className="hidden_upload" type="file" ref={this.uploader} onChange={this.load_preview_from_upload} accept="image/x-png,image/gif,image/jpeg" style={{ display: "none" }} />
          </div>);
      } else if (this.props.source === "webcam") {
        return (<div className="input_image">
          <div className="image_preview_holder">
            <Webcam ref={this.webcamRef} />
            <button class="snapshot" onClick={this.snapshot}>- Click to Take Snapshot -</button>
          </div>
        </div>);
      } else if (this.props.source === "canvas") {
        if (this.props.value === null && this.sketchRef && this.sketchRef.current) {
          this.sketchKey += 1;
        }
        return (<div className="input_image">
          <div className="image_preview_holder sketch">
            <SketchField
              ref={this.sketchRef}
              key={this.sketchKey}
              width='320px'
              height='100%'
              tool={Tools.Pencil}
              lineColor='black'
              lineWidth={20}
              backgroundColor="white"
              onChange={this.getSketch}
               /> 
          </div>
        </div>);
      }
    }
  }
  load_preview_from_drop(evt) {
    this.load_preview_from_files(evt.dataTransfer.files)
  }
  load_preview_from_upload(evt) {
    this.load_preview_from_files(evt.target.files);
  }
  load_preview_from_files(files) {
    if (!files.length || !window.FileReader || !/^image/.test(files[0].type)) {
      return;
    }
    var component = this;
    var ReaderObj = new FileReader()
    ReaderObj.readAsDataURL(files[0])
    ReaderObj.onloadend = function () {
      component.props.handleChange(this.result);
    }
  }
}

class ImageInputExample extends DataURLComponentExample {
  render() {
    return <img className="input_image_example" src={this.props.examples_dir + "/" + this.props.value} alt="" />
  }
}

export { ImageInput, ImageInputExample };
