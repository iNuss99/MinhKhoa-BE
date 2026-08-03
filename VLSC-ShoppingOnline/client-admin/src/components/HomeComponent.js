import React, { Component } from 'react';

class Home extends Component {
  render() {
    return (
      <div className="align-center">
        <h2 className="text-center">ADMIN HOME</h2>
        <img src={process.env.PUBLIC_URL + "/admin_home.png"} width="600px" height="600px" alt="" />
      </div>
    );
  }
}
export default Home;
