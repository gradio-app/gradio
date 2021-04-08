class TextboxOutput extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <div className="output_text">{this.props.value}</div>
  }
  load_example_preview(data) {
    if (typeof data == "string" && data.length > 20) {
      return data.substring(0,20) + "...";
    }
    return data;
  }
}
