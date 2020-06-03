import React from 'react';
import "./TopFeatures.css";

const topFeatures = (props) => {

  //turn features dict into array
  var features = props.features;
  var items = Object.keys(features).map(function(key) {
    return [key, features[key]];
  });

  return(
    <div className="topFeatures">
      <div data-aos="fade-up">
      <span>2. Average Features of Your Music</span>
      <p className="desc">Hover for more information!</p>
      </div>
        {items.map((item) => (
          <div data-aos="fade-in" className="card margin" style={{width: "20em"}}>
            <div className="card-body" data-hover={item[1].desc}>
              <div className="box_item" data-hover={item[1].desc}>
                {item[0]} <br></br>
                {item[1].value}
              </div>
            </div>
          </div>
        ))}
    </div>
  )
}

export default topFeatures;
