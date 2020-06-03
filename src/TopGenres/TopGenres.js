import React from 'react';
import "./TopGenres.css";
import {Pie} from 'react-chartjs-2'

const topGenres = (props) => {

  var genredict = props.genres;
  var items = Object.keys(genredict).map(function(key) {
    return [key, genredict[key]];
  });
  items = items.sort(function(first, second) {
    return second[1] - first[1];
  });
  items = items.slice(0, 10)

  var labels = [];
  var data = [];
  for(var i = 0, len = items.length; i < len; i++){
    labels.push(items[i][0]);
    data.push(items[i][1]);
  }

  var datasets=[{
    data: data,
    backgroundColor: ['#96304c', '#b44772', '#cd5a91', '#e76eb1', '#ff80ce', '#ff95d6', '#ffb0e1', '#fac6e5', '#fcdef0', '#fef2f9']
  }]

  return(
    <div data-aos="fade-right" className="topGenres card" style={{width: "45em"}}>
      <div className="card-body">
      <h2>This Month's Top Genres</h2>
      <Pie
        data={{
          labels: labels,
          datasets: datasets
        }} />
      </div>
    </div>
  )
}

export default topGenres;
