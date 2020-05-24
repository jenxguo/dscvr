import React, {Component} from 'react';
import './App.css';

import Spotify from 'spotify-web-api-js';
const spotifyApi = new Spotify();

//Primary App
class App extends Component {
  constructor(){
    super();
    const params = this.getHashParams();
    const token = params.access_token;
    if (token) {
      spotifyApi.setAccessToken(token);
    }
    this.state = {
      loggedIn: token ? true : false,
    }
  }

  //pull API token from query string
  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
       e = r.exec(q);
    }
    return hashParams;
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
