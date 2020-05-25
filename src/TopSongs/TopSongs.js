import React from 'react';
import "./TopSongs.css";

const topSongs = (props) => {
  return(
    <div className="topSongs">
      <p>Your top song is {props.songs[0].name}.</p>
    </div>
  )
}

export default topSongs;
