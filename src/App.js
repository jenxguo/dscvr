import React, {Component} from 'react';
import './App.css';

import TopSongs from './TopSongs/TopSongs'
import TopArtists from './TopArtists/TopArtists'

import SpotifyWebApi from 'spotify-web-api-js';
const spotifyApi = new SpotifyWebApi();

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
      //eventually make this a data structure with multiple songs, also holds ranking, title, image
      topSongs: {},
      topArtists: {},
      topGenres: {},
      dataLoaded: false
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

  //TODO
  // getTopGenres(){
  //   spotifyApi.getMyTopTracks({limit: 50, time_range: "short_term"})
  //   .then((response) => {
  //     this.setState({
  //       topGenres: response.items
  //     });
  //   })
  // }

  //API call to get user top tracks and top artists
  getData(){
    spotifyApi.getMyTopTracks({limit: 50, time_range: "short_term"})
    .then((tracks) => {
      spotifyApi.getMyTopArtists({limit: 30, time_range: "short_term"})
      .then ((artists) => {
        this.setState({
          topSongs: tracks.items,
          topArtists: artists.items,
          dataLoaded: true
        });
      })
    })
  }

  render(){
    return (
      <div className="App">
        {!this.state.loggedIn && (
          <a href='http://localhost:8888'> Login to Spotify </a>
        )}
        {this.state.loggedIn && !this.state.dataLoaded && (
          <button onClick={() => this.getData()}>Get Ready to DSCVR</button>
        )}
        {this.state.loggedIn && this.state.dataLoaded && (
          <div>
            <TopSongs songs={this.state.topSongs}/>
            <TopArtists artists={this.state.topArtists}/>
          </div>
        )}
      </div>
    );
  }
}

export default App;
