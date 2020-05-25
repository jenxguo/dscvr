import React, {Component} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import TopSongs from './TopSongs/TopSongs'
import TopArtists from './TopArtists/TopArtists'
import TopGenres from './TopGenres/TopGenres'

import * as $ from "jquery";
import SpotifyWebApi from 'spotify-web-api-js';
const spotifyApi = new SpotifyWebApi();

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
      userid: "",
      dataLoaded: false,
      topGenres: {},
      dataAnalyzed: false,
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

  //API call to get user top tracks/artists/userID
  getData(){
    spotifyApi.getMyTopTracks({limit: 50, time_range: "short_term"})
    .then((tracks) => {
      spotifyApi.getMyTopArtists({limit: 50, time_range: "short_term"})
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

  //helper method
  addToGenreDict(genre, genreDict) {
    for (var i = 0; i < genre.length; i++) {
      var g = genre[i]
      if (genreDict[g]) {
        genreDict[g] += 1;
      } else {
        genreDict[g] = 1;
      }
    }
    return genreDict;
  }

  //extract genres from top artists and count frequencies, stored as dictionary object
  getTopGenres(){
    var genreDict = {};
    var artists = this.state.topArtists;
    for (var i = 0; i < artists.length; i++) {
      genreDict = this.addToGenreDict(artists[i].genres, genreDict);
    }
    return genreDict;
  }

  //secondary data analysis function after filling state with initial data
  analyzeData(){
    this.setState({
      topGenres: this.getTopGenres(),
      dataAnalyzed: true
    })
  }

  //Adds songs to Favorites Playlist
  populateFavPlaylist() {
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

  //Creates an empty Favorites Playlist
  createFavPlaylist() {
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
    //Styles
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

    const linkStyle= {
      margin: "50em 0 0 0",
    };

    //Data Analysis Logic
    if (this.state.dataLoaded && !this.state.dataAnalyzed) {
      this.analyzeData();
    }

    //Fav Playlist Logic
    let favbutton =
      (<div className= "favoritePlaylist">
          <button onClick={() => this.createFavPlaylist()} type="button" className="btn btn-dark"> Make a playlist of your favorites!</button>
      </div>);

    if (this.state.createdFav) {
      favbutton = (
        <div className= "favoritePlaylistLink">
          <a target="_blank" style={linkStyle} href={this.state.favurl}> Check it out here! </a>
        </div>
      )
    }

    //Main App
    return (
      <div className="App">
        {!this.state.loggedIn && (
          <div>
            <h1>DSCVR</h1>
            <a style={linkStyle} href='http://localhost:8888'> Login to Spotify </a>
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
            <TopGenres genres={this.state.topGenres}/>
          </div>
        )}
      </div>
    );
  }
}

export default App;
