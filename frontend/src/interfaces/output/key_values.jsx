import React from 'react';
import ComponentExample from '../component_example';

class KeyValuesOutput extends React.Component {
  render() {
    return this.props.value ? <div className="output_keyvalues">
    <table>
      <thead>
        <th>Property</th>
        <th>Value</th>
      </thead>
      <tbody>
        {this.props.value.map(([key, value]) => {
          return <tr>
            <td>{key}</td>
            <td>{value}</td>
          </tr>
        })}
      </tbody>
    </table>
    </div> : false;
  }
}

class KeyValuesOutputExample extends ComponentExample {
  render() {
    return <div className="output_key_values_example">{this.props.value.map(([key, value]) => {
      return <div>{key}: {value}</div>
    })}
    {this.props.value.length > 3 ? <div>"..."</div> : false};
    </div>
  }
}

export {KeyValuesOutput, KeyValuesOutputExample};