import React from 'react';
import "./TopFeatures.css";

const topFeatures = (props) => {

  //turn features dict into array
  var features = props.features;
  var items = Object.keys(features).map(function(key) {
    return [key, features[key]];
  });

  return(
    <div className="topFeatures card" style={{width: "45em"}}>
      <div className="card-body">
      <h2>Overall Features of Your Favorite Music</h2>
      <ol>
        {items.map((item) => (
          <li><h6>Average {item[0]}: {item[1]}</h6></li>
        ))}
      </ol>
      </div>
    </div>
  )
}

export default topFeatures;
