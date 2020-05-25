import React from 'react';
import "./TopArtists.css";

const topArtists = (props) => {
  return(
    <div className="topArtists card" style={{width: "45em"}}>
      <div className="card-body">
        <h2>Your favorite artists of the past month</h2>
        <ol>
          {props.artists.map((item) => (
            <li>{item.name}</li>
          ))}
        </ol>
      </div>
    </div>
  )
}

export default topArtists;
