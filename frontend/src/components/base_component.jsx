import React from "react";

export default class BaseComponent extends React.Component {
  static memo = (a, b) => {
    return a.value === b.value && a.interpretation === b.interpretation;
  };
  static postprocess = (y) => {
    return y;
  };
}
