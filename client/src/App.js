import React, { Component } from 'react';
import './App.css';
import MainPage from './components/MainPage'

class App extends Component {
  render() {
    return (
      <div className="App" id="root" style= {{ height: "100%" }}>
        <MainPage/>
      </div>
    );
  }
}

export default App;
