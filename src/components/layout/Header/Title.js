//@flow
import React, { Component } from 'react';

// Figure out what I need to do to use the Text, View components in REACT.d
export default class Title extends Component {
  render() {
    return (
      <div style={this.props.titleStyle}>
        DHIS
      </div>
    );
  }
}