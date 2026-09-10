import React, { Component } from 'react';
import AuthPortal from './AuthPortalComponent';
import withRouter from '../utils/withRouter';

class Login extends Component {
  render() {
    return <AuthPortal {...this.props} defaultTab="login" />;
  }
}

export default withRouter(Login);
