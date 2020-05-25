import React, {Component} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import TopSongs from './TopSongs/TopSongs'
import TopArtists from './TopArtists/TopArtists'
import FavoritePlaylist from './FavoritePlaylist/FavoritePlaylist'

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
      userid: "",
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

  //API call to get user top tracks/artists/userID
  getData(){
    spotifyApi.getMyTopTracks({limit: 50, time_range: "short_term"})
    .then((tracks) => {
      spotifyApi.getMyTopArtists({limit: 30, time_range: "short_term"})
      .then ((artists) => {
        spotifyApi.getMe()
        .then((userinfo) => {
          this.setState({
            topSongs: tracks.items,
            topArtists: artists.items,
            userid: userinfo.id,
            dataLoaded: true
          });
        })
      })
    })
  }

  render(){
    const buttonStyle= {
      fontsize: "20px",
      display: "inline-block",
      padding: "0.35em 1.2em",
      border: "0.2em solid gray",
      textalign: "center",
      margin: "20em 0 0 0",
      borderradius: "0.12em",
      boxsizing: "border-box",
      textdecoration: "none",
      fontfamily:'Roboto, sans-serif',
      fontweight:'300',
      textalign: 'center',
      cursor: "pointer"
    };

    const loginStyle= {
      margin: "50em 0 0 0",
    };

    return (
      <div className="App">
        {!this.state.loggedIn && (
          <div>
            <h1>DSCVR</h1>
            <a style={loginStyle} href='http://localhost:8888'> Login to Spotify </a>
          </div>
        )}
        {this.state.loggedIn && !this.state.dataLoaded && (
          <button style={buttonStyle} onClick={() => this.getData()}>Get Ready to DSCVR</button>
        )}
        {this.state.loggedIn && this.state.dataLoaded && (
          <div>
            <TopSongs songs={this.state.topSongs.slice(0, 30)}/>
            <FavoritePlaylist userid= {this.state.userid} songs={this.state.topSongs}/>
            <TopArtists artists={this.state.topArtists.slice(0, 30)}/>
          </div>
        )}
      </div>
    );
  }
}

export default App;
