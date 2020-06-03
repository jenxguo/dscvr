import React, {Component} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Top from './Top/Top'
import TopGenres from './TopGenres/TopGenres'
import TopFeatures from './TopFeatures/TopFeatures'
import Logo from './Logo/Logo'

import * as $ from "jquery";
import AOS from 'aos';
import 'aos/dist/aos.css';
import SpotifyWebApi from 'spotify-web-api-js';
const spotifyApi = new SpotifyWebApi();

AOS.init();

function generateRandomString(length) {
          var text = '';
          var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

          for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
          }
          return text;
        };

export const authEndpoint = 'https://accounts.spotify.com/authorize';
// Replace with your app's client ID, redirect URI and desired scopes
const clientId = "ade8400ff2d0477cad2209f98f816ab9";
const redirectUri = "https://dscvrvibez.web.app/";
const scopes = "user-read-private user-read-email user-top-read playlist-modify-public";
const state = generateRandomString(16);

var authurl = 'https://accounts.spotify.com/authorize';
            authurl += '?response_type=token';
            authurl += '&client_id=' + encodeURIComponent(clientId);
            authurl += '&scope=' + encodeURIComponent(scopes);
            authurl += '&redirect_uri=' + encodeURIComponent(redirectUri);
            authurl += '&state=' + encodeURIComponent(state);


// Get the hash of the url
const hash = window.location.hash
  .substring(1)
  .split("&")
  .reduce(function(initial, item) {
    if (item) {
      var parts = item.split("=");
      initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    return initial;
  }, {});
window.location.hash = "";

class App extends Component {
  constructor(){
    super();
  //  const params = this.getHashParams();
    let token = hash.access_token;
    if (token) {
      spotifyApi.setAccessToken(token);
    }
    this.state = {
      token: token,
      loggedIn: token ? true : false,
      createdFav: false,
      topSongs: {},
      topArtists: {},
      userid: "",
      dataLoaded: false,
      topGenres: {},
      topFeatures: {
        Acousticness: {},
        Danceability: {},
        Energy: {},
        Instrumentalness: {},
        Speechiness: {},
        Valence: {},
        Tempo: {}
      },
      dataAnalyzed: false,
      favurl: "",
      favplayid: "",
      recURIs: [],
      dscvrurl: "",
      dscvrid: "",
      createdRec: false
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

  //average helper function
  average(nums) {
      return nums.reduce((a, b) => (a + b)) / nums.length;
  }

  //gets features of top tracks
  getTrackFeatures(){
    //grabbing song IDs
    var songIDs = [this.state.topSongs.length]
    for (var i = 0; i < this.state.topSongs.length; i++) {
      songIDs[i] = this.state.topSongs[i].id
    };
    spotifyApi.getAudioFeaturesForTracks(songIDs)
    .then((data) => {
        var features = data.audio_features;
        var featLen = features.length;
        var acousticness = [featLen];
        var danceability = [];
        var energy = [];
        var instrumentalness = [];
        var speechiness = [];
        var tempo = [];
        var valence = [];
        for (var i = 0; i < featLen; i++) {
          acousticness[i] = features[i].acousticness;
          danceability[i] = features[i].danceability;
          energy[i] = features[i].energy;
          instrumentalness[i] = features[i].instrumentalness;
          speechiness[i] = features[i].speechiness;
          tempo[i] = features[i].tempo;
          valence[i] = features[i].valence;
        }
        this.setState({
          topFeatures: {
            Acousticness:
              {
                value: Math.round(this.average(acousticness)*100)/100,
                desc: "Acousticness is a measure from 0.0 to 1.0 of how acoustic your tracks are, where 1.0 is most acoustic and 0.0 is least acoustic."
              },
            Danceability:
            {
              value: Math.round(this.average(danceability)*100)/100,
              desc: "Danceability is a measure from 0.0 to 1.0 of how suitable your tracks are for dancing, where 1.0 is most danceable and 0.0 is least danceable."
            },
            Energy:
            {
              value: Math.round(this.average(energy)*100)/100,
              desc: "Energy is a measure from 0.0 to 1.0 that represents how intense your tracks are, where 1.0 is most energetic and 0.0 is least energetic. An high energy track will feel fast, loud, noisy, and have more dynamic range and general entropy."
            },
            Instrumentalness:
            {
              value: Math.round(this.average(instrumentalness)*1000)/1000,
              desc: "Instrumentalness is a measure from 0.0 to 1.0 that predicts whether a track has no vocals, where tracks closer to 1.0 in instrumentalness are more likely to have no vocals and tracks closer to 0.0 have a lot of vocals, such as rap."
            },
            Speechiness:
            {
              value: Math.round(this.average(speechiness)*100)/100,
              desc: "Speechiness is a measure from 0.0 to 1.0 that detects the presence of spoken words in a track, where tracks with a speechiness closer to 1.0 are more likely to have exclusively spoken words and tracks closer to 0.0 represent music and non-spoken words."
            },
            Valence:
            {
              value: Math.round(this.average(valence)*100)/100,
              desc: "Valence is a measure from 0.0 to 1.0 that represents how positive your tracks are, where 1.0 is more positive and happy sounds and 0.0 is more negative and sad or angry sounds."
            },
            Tempo:
            {
              value: Math.round(this.average(tempo)),
              desc: "Tempo is the overall estimated tempo of a track in beats per minute (BPM)."
            }
          }
        });
      });
  }

  //secondary data analysis function after filling state with initial data
  analyzeData(){
    this.getTrackFeatures();
    this.setState({
      topGenres: this.getTopGenres(),
      dataAnalyzed: true
    });
  }

  //Adds songs to Favorites Playlist
  populateFavPlaylist() {
    //getting URIs for the songs
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
        this.populateFavPlaylist();
      }
    });
  }

  //Populates Rec Playlist
  populateRecPlaylist() {
    //ADD SONGS TO REC Playlist
    $.ajax({
      url: "https://api.spotify.com/v1/playlists/"+this.state.dscvrid+"/tracks",
      type: "POST",
      data: JSON.stringify({"uris": this.state.recURIs}),
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + this.state.token);
      }
    });
  }

  //Get Recommendations
  getRecs() {
    //Use top 5 artists as seeds
    var len = 5;
    var artistSeeds = [len];
    for (var i = 0; i < len; i++) {
      artistSeeds[i] = this.state.topArtists[i].id
    };
    var songURIs = [];
    //Grab Recommendations
     spotifyApi.getRecommendations({
      limit: 30,
      seed_artists: artistSeeds,
      min_popularity: 10,
      max_popularity: 50,
      target_acousticness: this.state.topFeatures.Acousticness.value,
      target_danceability: this.state.topFeatures.Danceability.value,
      target_energy: this.state.topFeatures.Energy.value,
      target_instrumentalness: this.state.topFeatures.Instrumentalness.value,
      target_speechiness: this.state.topFeatures.Speechiness.value,
      target_valence: this.state.topFeatures.Valence.value,
    })
    .then ((data) => {
      var tracks = data.tracks;
      for (var i = 0; i < tracks.length; i++) {
        songURIs.push(tracks[i].uri);
      }
      this.setState({
        recURIs: songURIs
      });
      this.populateRecPlaylist();
    });
  }

  //Create Rec Playlist
  createRecPlaylist() {
    $.ajax({
      url: "https://api.spotify.com/v1/users/"+this.state.userid+"/playlists",
      type: "POST",
      data: JSON.stringify({name: "you might like these BY DSCVR"}, {description: "Created with DSCVR."}),
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + this.state.token);
      },
      success: play => {
        this.setState({
          dscvrurl: play.external_urls.spotify,
          dscvrid: play.id,
          createdRec: true
        });
        this.getRecs();
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
      color: "#d9e254",
    };

    //Data Analysis Logic
    if (this.state.dataLoaded && !this.state.dataAnalyzed) {
      this.analyzeData();
    }

    //Fav Playlist Logic
    let favbutton =
      (<div className= "favoritePlaylist">
          <button onClick={() => this.createFavPlaylist()} type="button" className="btn btn-lg btn-light"> Click to make a playlist of your favorites!</button>
      </div>);

    if (this.state.createdFav) {
      favbutton = (
        <div className= "favoritePlaylistLink">
          <a target="_blank" style={linkStyle} href={this.state.favurl}> Your playlist is here. </a>
        </div>
      )
    }

    //Rec Button Logic
    let recbutton =
      (<div className= "recPlaylist">
          <button onClick={() => this.createRecPlaylist()} type="button" className="btn btn-light btn-lg margin"> Click to get DSCVR's recommendations!</button>
      </div>);

    if (this.state.createdRec) {
      recbutton = (
        <div className= "recPlaylistLink">
          <a target="_blank" style={linkStyle} href={this.state.dscvrurl}> Your playlist is here. </a>
        </div>
      )
    }

    //Main App
    return (
      <div className="App bg">
        {!this.state.loggedIn && (
          <div className="loginscreen">
            <div data-aos="fade-in" className="logincontent">
              <h1>DSCVR</h1><br></br>
              <a style={linkStyle} href={authurl}> Login to Spotify </a>
            </div>
          </div>
        )}
        {this.state.loggedIn && !this.state.dataLoaded && (
          <div className="firstscreen">
            <button data-aos="fade-in" className="dscvrbutton btn btn-lg btn-light" type="button" onClick={() => this.getData()}>Get Ready to DSCVR</button>
          </div>
        )}
        {this.state.loggedIn && this.state.dataLoaded && (
          <div>
            <Logo/>
            <div data-aos="fade-up">
              <div className="title">
                <span>1. Your Current Favorites</span>
              </div>
              <div className="top">
                  <Top songs={this.state.topSongs.slice(0, 10)} artists={this.state.topArtists.slice(0, 10)}/>
              </div>
            </div>
            <TopGenres genres={this.state.topGenres}/>
            <div data-aos="fade-left" className="button">
              {favbutton}
            </div>
            <TopFeatures features={this.state.topFeatures}/>
            <div data-aos="fade-up">
              <span>3. DSCVR</span>
              <p className="desc"> Find new music based on the average features of the music you already love.</p>
            </div>
            <div data-aos="fade-right" className="button">
              {recbutton}
            </div>
            Created by Jennifer Guo. Project completed June 2020.
          </div>
        )}
      </div>
    );
  }
}

export default App;
