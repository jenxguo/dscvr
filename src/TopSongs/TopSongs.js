import React from 'react';
import "./TopSongs.css";

const topSongs = (props) => {
  return(
    <div className="topSongs card" style={{width: "45em"}}>
      <div className="card-body">
      <h2>Your favorite songs of the past month</h2>
      <ol>
        {props.songs.map((item) => (
          <li><h6>{item.name}</h6>
              <p>{item.artists[0].name}</p></li>
        ))}
      </ol>
      </div>
    </div>
  )
}

export default topSongs;
