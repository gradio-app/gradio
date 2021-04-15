import React from 'react';

class ImageInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.uploader = React.createRef();
    this.openFileUpload = this.openFileUpload.bind(this);
    this.load_preview_from_files = this.load_preview_from_files.bind(this);
    this.load_preview_from_upload = this.load_preview_from_upload.bind(this);
    this.load_preview_from_drop = this.load_preview_from_drop.bind(this);
  }
  handleChange(evt) {
    this.props.handleChange(evt.target.value);
  }
  openFileUpload() {
    this.uploader.current.click();
  }
  render() {
    let no_action = (evt) => {
      evt.preventDefault();
      evt.stopPropagation();      
    }
    if (this.props.value != null) {
      return (<div className="interface_box">
        <div className="image_display">
          <div className="edit_holder">
            <button className="edit_image interface_button primary">Edit</button>
          </div>
          <div className="view_holders">
            <div className="image_preview_holder">
              <img className="image_preview" src={this.props.value} />
            </div>
          </div>
        </div>
      </div>)
    } else {
      return (<div className="interface_box" onDrag={no_action} onDragStart={no_action} onDragEnd={no_action} onDragOver={no_action} onDragEnter={no_action} onDragLeave={no_action} onDrop={no_action} >
        <div className="upload_zone drop_zone" onClick={this.openFileUpload} onDrop={this.load_preview_from_drop} >
          <div className="input_caption">Drop Image Here<br />- or -<br />Click to Upload</div>
        </div>
        <input className="hidden_upload" type="file" ref={this.uploader} onChange={this.load_preview_from_upload} accept="image/x-png,image/gif,image/jpeg" />
      </div>)
    }
  }
  // load_preview_from_drop(evt) {
  //   this.load_preview_from_files(evt.dataTransfer.files)
  // }
  // load_preview_from_upload(evt) {
  //   this.load_preview_from_files(evt.target.files);
  // }
  // load_preview_from_files(files) {
  //   if (!files.length || !window.FileReader || !/^image/.test(files[0].type)) {
  //     return;
  //   }
  //   var component = this;
  //   var ReaderObj = new FileReader()
  //   ReaderObj.readAsDataURL(files[0])
  //   ReaderObj.onloadend = function () {
  //     component.props.handleChange(this.result);
  //   }
  // }
}

export default ImageInput;