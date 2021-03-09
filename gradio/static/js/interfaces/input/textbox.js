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
          <textarea className="input_text"></textarea>
          <div className="output_text"></div>
        </div>
        )
    } else {
      return <input type="text" className="input_text" onChange={this.handleChange} value={this.props.value}></input>
    }
  }
  init(opts) {
    if (opts.placeholder) {
      this.target.find(".input_text").attr("placeholder", opts.placeholder)
    }
    this.target.find(".output_text").hide();
  }
  submit() {
    text = this.target.find(".input_text").val();
    this.io_master.input(this.id, text);
  }
  clear() {
    this.target.find(".input_text").val("");
    this.target.find(".output_text").empty();
    this.target.find(".input_text").show();
    this.target.find(".output_text").hide();
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
