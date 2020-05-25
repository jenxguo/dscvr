import React, {Component} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import TopSongs from './TopSongs/TopSongs'
import TopArtists from './TopArtists/TopArtists'

import * as $ from "jquery";
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
      token: token,
      loggedIn: token ? true : false,
      //eventually make this a data structure with multiple songs, also holds ranking, title, image
      createdFav: false,
      topSongs: {},
      topArtists: {},
      topGenres: {},
      userid: "",
      dataLoaded: false,
      favurl: "",
      favplayid: ""
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
            dataLoaded: true,
          });
        })
      })
    })
  }

  populatePlaylist() {
    var songURIs = [this.state.topSongs.length]
    for (var i = 0; i < this.state.topSongs.length; i++) {
      songURIs[i] = this.state.topSongs[i].uri
    };
    $.ajax({
      url: "https://api.spotify.com/v1/playlists/"+this.state.favplayid+"/tracks",
      type: "POST",
      data: JSON.stringify({"uris": songURIs}),
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + this.state.token);
      }
    });
  }

  createPlaylist() {
    var today = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
    var date = monthNames[today.getMonth()] + " " + today.getFullYear();
    $.ajax({
      url: "https://api.spotify.com/v1/users/"+this.state.userid+"/playlists",
      type: "POST",
      data: JSON.stringify({name: "Your " + date + " Favorites"}, {description: "Created with DSCVR."}),
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + this.state.token);
      },
      success: play => {
        this.setState({
          favurl: play.external_urls.spotify,
          favplayid: play.id,
          createdFav: true
        });
        this.populatePlaylist();
      }
    });
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

    let favbutton =
      (<div className= "favoritePlaylist">
          <button onClick={() => this.createPlaylist()} type="button" class="btn btn-dark"> Make a playlist of your favorites!</button>
      </div>);

    if (this.state.createdFav) {
      favbutton = (
        <div className= "favoritePlaylistLink">
          <a target="_blank" style={loginStyle} href={this.state.favurl}> Check it out here! </a>
        </div>
      )
    }

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
            {favbutton}
            <TopArtists artists={this.state.topArtists.slice(0, 30)}/>
          </div>
        )}
      </div>
    );
  }
}

export default App;
