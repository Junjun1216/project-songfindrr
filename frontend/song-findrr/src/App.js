import React, { Component } from 'react';
import './App.css';
import { Provider } from 'react-redux';
import MainPage from './components/MainPage'
import store from './store.js'

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <MainPage/>
        </div>
      </Provider>
    );
  }
}

export default App;
