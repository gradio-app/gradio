class TextboxInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(evt) {
    this.props.handleChange(evt.target.value);
  }
  render() {
    if (this.props.lines > 1) {
      return (
        <div>
          <textarea className="input_text" onChange={this.handleChange}>
            {this.props.value}
          </textarea>
        </div>
        )
    } else {
      return <input type="text" className="input_text" onChange={this.handleChange} value={this.props.value}></input>
    }
  }
  show_interpretation(data) {
    this.target.find(".input_text").hide();
    this.target.find(".output_text").show();
    let html = "";
    for (let [i, char_set] of data.entries()) {
      [char, score] = char_set;
      let color = getSaliencyColor(score);
      html += `<span className='alternate'
        alternate_index=${i}
        style="background-color: ${color}">${char}</span>`
    }
    this.target.find(".output_text").html(html);
  }
  load_example_preview(data) {
    if (data.length > 20) {
      return data.substring(0,20) + "...";
    }
    return data;
  }
  load_example(data) {
    this.target.find(".input_text").val(data);    
  }
}
