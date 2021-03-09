class TextboxOutput extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <div className="output_text"></div>
  }
  init(opts) {
  }
  output(data) {
    this.target.find(".output_text").text(data);
  }
  submit() {
  }
  clear() {
    this.target.find(".output_text").empty();
  }
  load_example_preview(data) {
    if (typeof data == "string" && data.length > 20) {
      return data.substring(0,20) + "...";
    }
    return data;
  }
}
