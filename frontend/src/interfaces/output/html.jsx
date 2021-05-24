import React from 'react';
import ComponentExample from '../component_example';

class HTMLOutput extends React.Component {
  render() {
    return this.props.value ? <div className="output_html"
      dangerouslySetInnerHTML={{ __html: this.props.value }}>
    </div> : false;
  }
}

class HTMLOutputExample extends ComponentExample {
  render() {
    return <div className="output_html_example">[HTML]</div>
  }
}

export {HTMLOutput, HTMLOutputExample};
