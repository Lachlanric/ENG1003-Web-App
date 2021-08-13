"use strict";

// Keys
const TRIP_AIRPORTS_KEY = "tripAirports";
const TRIP_COUNTRY_KEY = "tripCountry";
const TRIP_DATE_KEY = "tripDate";

// Global variables
let countriesRef = document.getElementById("countries");
let countryInputRef = document.getElementById("countryInput");
let countriesOutput = "";
let mapMarkers = [];
let mapReady = false;

let countrySelected = "";
let countryNew = "";    //temp
let airportsData = [];
let airportsNew = [];   //temp
let routesData = [];

let tripArray = [];
let adjAirports = [];
let requiredAirports = [];

let newTrip = false;

let tripColour = "#b33";

updateSidePanel();

// Add the ability to press enter to activate the coutnry search
countryInputRef.addEventListener('keyup',function(e){
    if (e.key == "Enter") {
        getAirportData()
  }
});

// Loading spinner
let loadingSpinner = document.getElementById("loadingSpinner");
loadingSpinner.style.opacity = 0;

// Displaying the map on the page
mapboxgl.accessToken = 'pk.eyJ1IjoiZWxhaW5lMjAzNCIsImEiOiJja2cxc3BlaDcwMXN4MndvZW9vYWpsbGs1In0.kN33nh_Vh1M7PB6XgeGZUA';
let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11'
});
map.addControl(new mapboxgl.NavigationControl());

// ON MAP LOAD
map.on('load', function () {
    mapReady = true;

    // Enable country input only once map has loaded
    countryInputRef.style.pointerEvents = "auto";

    // If trip data exists in local storage, then the user clicked on "edit trip" from comfirm trip page
    // We load trip from that data
    let storedTrip = JSON.parse(localStorage.getItem(TRIP_AIRPORTS_KEY));
    
    newTrip = (storedTrip == null);
    if (!newTrip)
    {
        tripArray = storedTrip.map(function(airport){
            return airport.airportId;
        })
        countryNew = localStorage.getItem(TRIP_COUNTRY_KEY);
        let date = localStorage.getItem(TRIP_DATE_KEY);

        document.getElementById("dateInput").value = date;
        countryInputRef.value = countryNew;

        // Loading spinner
        loadingSpinner.style.opacity = 1;

        mapReady = false;

        // Creating a data variable for a web service request
        let data = {
            country: countryNew,
            callback: "showAirportData"
        };

        // Creating URL and calling the web service request
        let url = "https://eng1003.monash/OpenFlights/airports/";
        webServiceRequest(url, data);
    }
});








// Iterating through all the countries (in countries.js library) and appending it to countriesOutput
for (let i = 0; i < countryData.length; i++)
{
    countriesOutput += `<option value="${countryData[i]}"></option>`;
}

// Updating innerHTML to display all the countries on page
countriesRef.innerHTML = countriesOutput;


function getAirportData()
/* Function for a web service request to the airport API
*/
{
    // Only execute if map is loaded
    if (!mapReady) return false;

    // Retrieve the selected country
    countryNew = document.getElementById("countryInput").value;

    // Don't do anything if no country is selected
    if (countryNew == "") return false;
    
    // Creating a data variable for a web service request
    let data = {
        country: countryNew,
        callback: "showAirportData"
    };

    // Loading spinner
    loadingSpinner.style.opacity = 1;

    mapReady = false;

    // Creating URL and calling the web service request
    let url = "https://eng1003.monash/OpenFlights/airports/";
    webServiceRequest(url, data);
}

function showAirportData(result)
/* A function to display the selected airport on the map

:pre: result is data returned from the airport API
:post: a marker is placed on the map at the location of the selected airport
*/
{
    //console.log(result);

    // Invalid Input
    if (result.length == 0)
    {
        // Loading spinner
        //loadingSpinner.style.opacity = 0;
        mapReady = true;
        alert("Please select a valid country");
        loadingSpinner.style.opacity = 0;
        return false;
    }

    // Update temp global vars
    airportsNew = result;
    //airportsData = result;
    //countrySelected = result[0].country;
    

    // Get Route Data
    let url = "https://eng1003.monash/OpenFlights/allroutes/";
    let data = {
        country: countryNew,
        callback: "showRouteData"
    }
    webServiceRequest(url, data);
}


function showRouteData(result)
{

    // Only Connected
    requiredAirports = [];
    
    requiredAirports = getConnectedAirports(airportsNew, result);

    // If there are no connected airports to show
    if (requiredAirports.length <= 1)
    {
        requiredAirports = airportsNew;
        alert("\nNo routes found in "+countryNew);
        mapReady = true;
        loadingSpinner.style.opacity = 0;
        return false;
    }
    //console.log(requiredAirports);

    // New country is legit, so update global vars
    routesData = result;
    airportsData = airportsNew;
    countrySelected = countryNew;

    // Remove all current markers
    for (let i = mapMarkers.length - 1; i >= 0; i--) {
        mapMarkers[i].remove();
    }

    if (newTrip)
    {
        // Remove all current adjacent route lines, trip lines, and origin circle
        tripArray = [];
        adjAirports = [];
    }

    clearMap();
    updateSidePanel();
    // Add markers and move map accordingly
    moveMapWithMarkers(requiredAirports);

    mapReady = true;
    loadingSpinner.style.opacity = 0;

}

// Returns the airport object with the given AirportId, null if it doesn't exist
function getAirportById(id, airports)
{
    for(let i = 0; i < airports.length; i++)
    {
        //console.log("checking "+airports[i].airportId+" against "+id);
        if (airports[i].airportId == id)
        {
            return airports[i];
        }
    }
    return null;
}

function getConnectedAirports(airportsData, routesData)
{
    let availableAirports = [];
    let connectedAirports = [];

    // Get current airport IDs
    for(let i = 0; i < airportsData.length; i++)
    {
        availableAirports.push(Number(airportsData[i].airportId));
    }

    // Get airport route source/destiantion IDs
    for(let i = 0; i < routesData.length; i++)
    {
        let sourceID = routesData[i].sourceAirportId;
        let destID = routesData[i].destinationAirportId;

        // Check if valid route
        if (availableAirports.includes(sourceID) && availableAirports.includes(destID))
        {
            // Check if not already added, and then add it
            if (!( connectedAirports.includes(sourceID) ))
            {
                connectedAirports.push(sourceID);
            }
            if (!( connectedAirports.includes(destID) ))
            {
                connectedAirports.push(destID);
            }
        }
    }

    // Get intersection
    let validAirportIDs = connectedAirports.filter(airport => availableAirports.includes(airport));
    let validAirports = [];
    for(let i = 0; i < validAirportIDs.length; i++)
    {
        validAirports.push( getAirportById(validAirportIDs[i], airportsData) );
    }

    return validAirports;
}

// Moves the map and adds markers based on a list of airports
function moveMapWithMarkers(result)
{
    // Initialising arrays for all the latitudes and longitudes   
    let latitudes = [];
    let longitudes = [];

    // Iterating through all the airports
    for (let i = 0; i < result.length; i++)
    {
        // Creating a marker for the map
        let marker = new mapboxgl.Marker({"color": "#FF8C00"});
        marker.setLngLat([result[i].longitude, result[i].latitude]);
        marker.getElement().value = result[i].airportId;
        marker.getElement().addEventListener('click', function()
        {

            // If this airport is adjacent and is not already part of trip, (or if the trip is current empty)
            if (tripArray.length == 0 || (adjAirports.includes(this.value) && !tripArray.includes(this.value)))
            {
                tripArray.push(this.value);

                let data = {
                    sourceAirport: this.value,
                    callback: "getAdjAirports"
                }
                let url = "https://eng1003.monash/OpenFlights/routes/";
    
                webServiceRequest(url, data);
            }
            else
            {
                if (tripArray.includes(this.value))
                {
                    alert("This airport is already part of your trip.")
                }
                else
                {
                    alert("This airport is not connected to "+getAirportById(tripArray[tripArray.length-1], airportsData).name);
                }
            }

        })
        mapMarkers.push(marker);
      
        /*
        // Offsetting marker and initialing description
        let popup = new mapboxgl.Popup();
        let desc = `${result[i].name}`;

        // Attach the description to popup
        popup.setHTML(desc);

        // Attach the popup to the marker
        marker.setPopup(popup);*/
        
        // Add the marker to the map
        marker.addTo(map);

        // Appending to lat/lng arrays
        latitudes.push(result[i].latitude);
        longitudes.push(result[i].longitude);
    }

    // Calcualting the extreme latitudes
    let maxLat = latitudes.reduce((a, b) => Math.max(a, b));
    let minLat = latitudes.reduce((a, b) => Math.min(a, b));

    // Calculating the extreme longitudes, compensating for when they lie on either side of prime meridian
    let longitudesSorted = longitudes.sort( (a,b) => a-b );
    let maxLng = longitudesSorted[longitudesSorted.length - 1];
    let minLng = longitudesSorted[0];

    // Iterate through the sorted longitude values
    for(let i = 1; i < longitudesSorted.length; i++)
    {
        // If a consecutive pair differs by a lot, then it's most likely been split along the prime meridian
        if (longitudesSorted[i] - longitudesSorted[i-1] > 180)
        {
            // If this is the case, then we've also found our min and max
            maxLng = String(360 + Number(longitudesSorted[i-1]));
            minLng = longitudesSorted[i];
            break;
        }
    }

    // If the extremes are right next to each other due to there being only one airport, the extremes are padded
    if (maxLng - minLng < 2)
    {
        maxLng = String( Number(maxLng) + 1 );
        minLng = String( Number(minLng) - 1 );
    }
    
    // Setting the map bounds
    map.fitBounds([[minLng, minLat], [maxLng, maxLat]], {padding: {top: 50, bottom: 50, left: 50, right: 50}});

    // If not a new trip, draw current trip
    if (!newTrip)
    {
        let data = {
            sourceAirport: tripArray[tripArray.length-1],
            callback: "getAdjAirports"
        }
        let url = "https://eng1003.monash/OpenFlights/routes/";

        webServiceRequest(url, data);

        updateSidePanel();

        // Clear any current trip from local storage
        newTrip = true;
        localStorage.setItem(TRIP_AIRPORTS_KEY, null);
        localStorage.setItem(TRIP_DATE_KEY, null);
        localStorage.setItem(TRIP_COUNTRY_KEY, null);
    }
}

// When user clicks undo
function undo()
{
    if (tripArray.length > 0)
    {
        tripArray.pop();

        // If trip still contains airports
        if (tripArray.length > 0)
        {
            let data = {
                sourceAirport: tripArray[tripArray.length-1],
                callback: "getAdjAirports"
            }
            let url = "https://eng1003.monash/OpenFlights/routes/";

            webServiceRequest(url, data);
        }
        // Otherwise, remove all map layers since the previous function isn't called
        else
        {
            // Remove all current adjacent route lines, trip lines, and origin circle   
            clearMap();
        }
    }

    updateSidePanel();
}

// Callback function after clicking on a marker.
// Determines available routes from the given airport
// Updates the map based on the trip and available routes
function getAdjAirports(result)
{
    // Determine the valid adjacent airports
    adjAirports = [];
    for(let i = 0; i < result.length; i++)
    {
        let source = getAirportById(result[i].sourceAirportId, airportsData);
        let destination = getAirportById(result[i].destinationAirportId, airportsData);

        // Valid Route?
        if (source == null || destination == null || adjAirports.includes(destination.airportId) || tripArray.includes(destination.airportId))
        {
            //console.log("Airport doesn't exist");
            continue;
        }
        else
        {
            adjAirports.push(destination.airportId);
            //console.log(`Found route between ${source.name} (${source.airportId}) and ${destination.name} (${destination.airportId})`);
        }
    }

    // Draw all available routes
    let lineList = [];
    let source = getAirportById(result[0].sourceAirportId, airportsData);
    for(let i = 0; i < adjAirports.length; i++)
    {
        let destination = getAirportById(adjAirports[i], airportsData);

        let lat1 = source.latitude;
        let lat2 = destination.latitude;
        let lng1 = source.longitude;
        let lng2 = destination.longitude;

        // Swap the longitudes if the route crosses 180th prime meridian
        if (Math.abs(lng1 - lng2) > 270)
        {
            if (lng1 < 0)
            {
                lng1 = String(Number(lng1) + 360);
            }
            else if (lng2 < 0)
            {
                lng2 = String(Number(lng2) + 360);
            }
        }

        lineList.push({
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [[lng1, lat1], [lng2, lat2]]
            }
        })
    }

    // Remove all current adjacent route lines, trip lines, and origin circle
    clearMap();

    // Show adjacent routes
    map.addSource('adjRoutes', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': lineList
        }
    });
    map.addLayer({
        id: 'routes',
        type: "line",
        source: 'adjRoutes',
        layout: { "line-join": "round", "line-cap": "round"},
        paint: { "line-color": "#444", "line-width": 3, "line-opacity": 0.65, "line-dasharray": [2,2] }
    });

    // Show current trip on map
    let tripArrayCoords = [];
    for(let i = 0; i < tripArray.length; i++)
    {
        let airport = getAirportById(tripArray[i], airportsData);

        // console.log("tripArrayCoords");
        // console.log(tripArrayCoords);

        let lng = airport.longitude;

        if (i != 0)
        {
            let lngPrev = tripArrayCoords[i-1][0];

            console.log("current, prev = "+lng+", "+lngPrev)

            if (lng - lngPrev > 300)
            {
                lng = String( Number(lng) - 360) ;
            }
            if (lngPrev - lng > 300)
            {
                lng = String( Number(lng) + 360) ;
            }

            console.log("current, prev = "+lng+", "+lngPrev)
        }

        tripArrayCoords.push([lng, airport.latitude]);
    }

    console.log("tripArrayCoords");
    console.log(tripArrayCoords);

    map.addSource('tripSource', {
        type: "geojson",
        data: {
            type: "Feature",
            properties: {},
            geometry: {
                type: "LineString",
                coordinates: tripArrayCoords
            }
        }
    });
    map.addLayer({
        id: 'trip',
        type: "line",
        source: 'tripSource',
        layout: { "line-join": "round", "line-cap": "round"},
        paint: { "line-color": tripColour, "line-width": 7 }
    });

    // Draw circle for origin
    if (tripArray.length > 0)
    {
        let airport = getAirportById(tripArray[0], airportsData);

        map.addSource("originSource", {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [airport.longitude, airport.latitude]
                    }
                }]
            }
        });
        map.addLayer({
            id: 'origin',
            type: 'circle',
            source: 'originSource',
            paint: {
                "circle-radius": 15,
                "circle-color": tripColour,
            }
        });
    }
    
    console.log("adjAirports");
    console.log(adjAirports);
    console.log("tripArray");
    console.log(tripArray);

    updateSidePanel();
}

function updateSidePanel()
{
    let output = "";

    // No routes added
    if (tripArray.length == 0)
    {
        output = `
        <br><br>
        <li">
            <span style="display: inline-grid; grid-template-columns: auto;">
                <span>To start planning a route, select a country from above. Then click on an airport to add it to your trip.</span>
            </span>
        </li>
        `;
    }
    // Display routes
    else
    {
        for(let i = 0; i < tripArray.length; i++)
        {

            if (i == 0)
            {
                output += `
                    <li class="mdl-list__item mdl-shadow--2dp">
                        <span class="mdl-list__item-primary-content" style="padding:1vw; position:relative; display: inline-grid; grid-template-columns: auto;">
                        <span>${ getAirportById(tripArray[i], airportsData).name }</span>
                        <span id="origin">  </span>
                        </span>
                    </li>
                `;
            }
            else
            {
                output += `
                    <!-- Arrow -->
                    <div class="arrowtail"></div>
                    <div class="arrowhead"></div>

                    <!-- Block -->
                    <li class="mdl-list__item mdl-shadow--2dp">
                        <span class="mdl-list__item-primary-content" style="display: inline-grid; grid-template-columns: auto;">
                        <span>${ getAirportById(tripArray[i], airportsData).name }</span>
                        </span>
                    </li>
                `;
            }
        }
    }

    document.getElementById("sidePanel").innerHTML = output;
}

function clearMap()
{
    // Remove all current adjacent route lines, trip lines, and origin circle
    if (map.getLayer("routes") != undefined) map.removeLayer("routes");
    if (map.getSource("adjRoutes") != undefined) map.removeSource("adjRoutes");
    if (map.getLayer("trip") != undefined) map.removeLayer("trip");
    if (map.getSource("tripSource") != undefined) map.removeSource("tripSource");
    if (map.getLayer("origin") != undefined) map.removeLayer("origin");
    if (map.getSource("originSource") != undefined) map.removeSource("originSource");
}

function confirmTrip()
{
    let date = document.getElementById("dateInput").value;

    if (countrySelected == "")
    {
        alert("You must select a country first");
    }
    else if (tripArray.length <= 1)
    {
        alert("You must add at least 2 airports to your trip")
    }
    else if (date == "")
    {
        alert("You must select a date");
    }
    else
    {
        // Valid trip, go to confirm trip page
        let airports = tripArray.map(function(id) { return getAirportById(id, airportsData) });

        localStorage.setItem(TRIP_AIRPORTS_KEY, JSON.stringify(airports));
        localStorage.setItem(TRIP_DATE_KEY, date);
        localStorage.setItem(TRIP_COUNTRY_KEY, countrySelected);

        window.location = "confirmTripsPage.html";
    }
}