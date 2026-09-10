import React, { Component } from 'react';
import AuthPortal from './AuthPortalComponent';
import withRouter from '../utils/withRouter';

class Active extends Component {
  render() {
    return <AuthPortal {...this.props} defaultTab="active" />;
  }
}

export default withRouter(Active);
