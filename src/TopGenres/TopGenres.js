import React from 'react';
import "./TopGenres.css";

const topGenres = (props) => {

  var genredict = props.genres;
  var genrearr = [];

  for (var key in genredict) {
    if (genredict.hasOwnProperty(key)) {
        genrearr.push( [ key, genredict[key] ] );
    }
  }

  return(
    <div className="topGenres card" style={{width: "45em"}}>
      <div className="card-body">
      <h2>Your favorite genres of the past month</h2>
      <ol>
        {genrearr.map((item) => (
          <li><h6>{item[0]}</h6>
              <p>{item[1]}</p></li>
        ))}
      </ol>
      </div>
    </div>
  )
}

export default topGenres;
