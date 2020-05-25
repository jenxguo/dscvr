import React from 'react';
import "./TopArtists.css";

const topArtists = (props) => {
  return(
    <div className="topArtists">
      <p>Your top artist is {props.artists[0].name}.</p>
    </div>
  )
}

export default topArtists;
