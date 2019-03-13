import React, { Component } from 'react';
import './App.css';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import MainPage from './components/MainPage'
import LyricResults from './components/LyricResults'
import store from './store.js'

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <MainPage/>
          <LyricResults/>
        </div>
      </Provider>
    );
  }
}

export default App;
