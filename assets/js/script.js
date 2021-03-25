var getCity = function() {
  var city = 'Los Angeles';
  var apiURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=apikey";

  fetch(apiURL).then(function(response) {
    if (response.ok) {
      response.json().then(function(data) {
        getCityOneCall(data);
      });
    } else {
      alert("Error: " + response.statusText);
    }
  })
  .catch(function(error) {
    alert('Unable to connect');
  });
};

var getCityOneCall = function(data) {
  var lat = data.coord.lat;
  var lon = data.coord.lon;
  var apiURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" 
  + lat + "&lon=" + lon + "&appid=apikey";

  fetch(apiURL).then(function(response) {
    if (response.ok) {
      response.json().then(function(data) {
        displayWeather(data);
      });
    } else {
      alert("Error: " + response.statusText);
    }
  })
  .catch(function(error) {
    alert('Unable to connect');
  });
}

var displayWeather = function(data) {
  console.log(data);
  
};

getCity();