# User Manual

- Search bar for inputing the location
- Search button for confirming the input
- Radio buttons for changing the unit type
- Get my location button for searching for weather at the current location
- Switching to different API/weather provider can be done via the link at the bottom (accessible after searching for a location)

### Issues

- One issue encountered sometimes when fetching data from WeatherAPI
    - localhost data fetch blocked by CORS policy (No 'Access-Control-Allow-Origin' header present)
    - this would be eliminated in "production" and is happening randomly (at least for me, happened twice and lasted for few hours) 
    - I suppose it may be due to the API availability or some other API server settings
