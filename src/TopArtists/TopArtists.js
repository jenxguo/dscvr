import React from 'react';
import "./TopArtists.css";

const topArtists = (props) => {
  return(
    <div className="topArtists card" style={{width: "30em"}}>
      <div className="card-body">
        <h2>Your favorite artists of the past month</h2>
        <ol>
          {props.artists.map((item) => (
            <li>
              <img src={item.images[0].url} style={{ height: 100 }}/>
              <h6>{item.name}</h6>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

export default topArtists;
