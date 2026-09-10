import React, { Component } from 'react';
import AuthPortal from './AuthPortalComponent';
import withRouter from '../utils/withRouter';

class Signup extends Component {
  render() {
    return <AuthPortal {...this.props} defaultTab="signup" />;
  }
}

export default withRouter(Signup);
