import React from 'react';
import "./FavoritePlaylist.css";

import SpotifyWebApi from 'spotify-web-api-js';
const spotifyApi = new SpotifyWebApi();

var url = "p";

function makePlaylist() {
  spotifyApi.createPlaylist({user_id: "jeezygotstacks", name: "cool"})
    // //if time, could make the description the current date
    // {name: "Your Current Favorites", description: "Created by DSCVR and Curated by YOU!"}
  .then((info) => {
    url = info.external_urls.spotify
  })
};

const favoritePlaylist = (props) => {
  return(
    <div className= "favoritePlaylist">
      <p>{props.userid}</p>
        <button onClick={() => makePlaylist()} type="button" class="btn btn-dark">Make a playlist of your favorites!</button>
        <p>{url}</p>
    </div>
  )
}

export default favoritePlaylist;
