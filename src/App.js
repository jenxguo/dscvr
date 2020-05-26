import React, {Component} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import TopSongs from './TopSongs/TopSongs'
import TopArtists from './TopArtists/TopArtists'
import TopGenres from './TopGenres/TopGenres'
import TopFeatures from './TopFeatures/TopFeatures'

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
      createdFav: false,
      topSongs: {},
      topArtists: {},
      userid: "",
      dataLoaded: false,
      topGenres: {},
      topFeatures: {
        acousticness: null,
        danceability: null,
        energy: null,
        instrumentalness: null,
        speechiness: null,
        valence: null,
        tempo: null
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
            acousticness: Math.round(this.average(acousticness)*100)/100,
            danceability: Math.round(this.average(danceability)*100)/100,
            energy: Math.round(this.average(energy)*100)/100,
            instrumentalness: Math.round(this.average(instrumentalness)*1000)/1000,
            speechiness: Math.round(this.average(speechiness)*100)/100,
            valence: Math.round(this.average(valence)*100)/100,
            tempo: Math.round(this.average(tempo))
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

  //Gets recommended songs
  getRecs() {
    //Use top 5 artists as seeds
    var len = 5;
    var artistSeeds = [len];
    for (var i = 0; i < len; i++) {
      artistSeeds[i] = this.state.topArtists[i].id
    }

    var playlen = 30;
    var songURIs = [playlen]

    //API call
    //should we add tempo?
     spotifyApi.getRecommendations({
      limit: playlen,
      seed_artists: artistSeeds,
      max_popularity: 50,
      target_acousticness: this.state.topFeatures.acousticness,
      target_danceability: this.state.topFeatures.danceability,
      target_energy: this.state.topFeatures.energy,
      target_instrumentalness: this.state.topFeatures.instrumentalness,
      target_speechiness: this.state.topFeatures.speechiness,
      target_valence: this.state.topFeatures.valence
    })
    .then ((data) => {
      var tracks = data.tracks;
      for (var i = 0; i < playlen; i++) {
        songURIs[i] = tracks[i].uri;
      }
      this.setState({
        recURIs: songURIs
      })
    })
    console.log(songURIs)
  }

  //Populates Rec Playlist
  populateRecPlaylist() {
    //GET RECS
    //Use top 5 artists as seeds
    var len = 5;
    var artistSeeds = [len];
    for (var i = 0; i < len; i++) {
      artistSeeds[i] = this.state.topArtists[i].id
    }

    var playlen = 30;
    var songURIs = [playlen]

    //API call
    //should we add tempo?
     spotifyApi.getRecommendations({
      limit: playlen,
      seed_artists: artistSeeds,
      max_popularity: 50,
      target_acousticness: this.state.topFeatures.acousticness,
      target_danceability: this.state.topFeatures.danceability,
      target_energy: this.state.topFeatures.energy,
      target_instrumentalness: this.state.topFeatures.instrumentalness,
      target_speechiness: this.state.topFeatures.speechiness,
      target_valence: this.state.topFeatures.valence
    })
    .then ((data) => {
      var tracks = data.tracks;
      for (var i = 0; i < playlen; i++) {
        songURIs[i] = tracks[i].uri;
      }
    });
    console.log(songURIs)
    //actually populate playlist
    $.ajax({
      url: "https://api.spotify.com/v1/playlists/"+this.state.dscvrid+"/tracks",
      type: "POST",
      data: JSON.stringify({"uris": songURIs}),
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + this.state.token);
      }
    });
  }

  //Create Rec Playlist
  createRecPlaylist() {
    var today = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
    var date = monthNames[today.getMonth()] + " " + today.getFullYear();
    $.ajax({
      url: "https://api.spotify.com/v1/users/"+this.state.userid+"/playlists",
      type: "POST",
      data: JSON.stringify({name: "Your " + date + " Recommendations"}, {description: "Created with DSCVR."}),
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + this.state.token);
      },
      success: play => {
        this.setState({
          dscvr: play.external_urls.spotify,
          dscvrid: play.id,
          createdRec: true
        });
        this.populateRecPlaylist();
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

    //Rec Button Logic
    let recbutton =
      (<div className= "recPlaylist">
          <button onClick={() => this.createRecPlaylist()} type="button" className="btn btn-dark"> Get recommendations based on data!</button>
      </div>);

    if (this.state.createdFRec) {
      recbutton = (
        <div className= "recPlaylistLink">
          <a target="_blank" style={linkStyle} href={this.state.dscvrurl}> Check it out here! </a>
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
            <TopFeatures features={this.state.topFeatures}/>
            {recbutton}
          </div>
        )}
      </div>
    );
  }
}

export default App;
