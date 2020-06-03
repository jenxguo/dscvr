import React from 'react';
import "./Top.css";

const top = (props) => {
  return(
    <div class="row top">

      <div class="col-sm-6">
        <div className="topSongs card" style={{width: "30em"}}>
          <div className="card-body">
          <h2>This Month's Top Songs:</h2>
          <div className="listcontain">
            <ol>
              {props.songs.map((item) => (
                <li className="litop">
                  <div className="container">
                    <div className="imgs">
                      <img alt="album cover" src={item.album.images[0].url} style={{ height: 100 }}/>
                    </div>
                    <div className="txts">
                      <h6>{item.name}</h6>
                      <p>{item.artists[0].name}</p>
                    </div>
                    </div>
                </li>
              ))}
            </ol>
          </div>
          </div>
        </div>
      </div>

      <div class="col-sm-6">
        <div className="topArtists card" style={{width: "30em"}}>
          <div className="card-body">
            <h2>This Month's Top Artists:</h2>
            <div className="listcontain">
            <ol>
              {props.artists.map((item) => (
                <li className="litop">
                  <div className="container">
                    <div className="imgs">
                      <img alt="artist" src={item.images[0].url} style={{ height: 100 }}/>
                    </div>
                    <div className="txts">
                      <h6>{item.name}</h6>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default top;
