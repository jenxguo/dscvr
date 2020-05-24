import React, {Component} from 'react';
import './App.css';

//Primary App
class App extends Component {
  constructor() {
    super();
  }

  render(){
    return (
      <div className="App">
        <a href='http://localhost:8888'> Login to Spotify </a>
      </div>
    );
  }
}

export default App;
