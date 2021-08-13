"use strict";

// Global variables
let countriesRef = document.getElementById("countries");
let countriesOutput = "";
let mapMarkers = [];
let mapReady = false;

let countrySelected = "";
let airportsData = [];
let routesData = [];

let showOnlyConnected = false;

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

// Initialise Temporary Map Objects 
map.on('load', function () {

    mapReady = true;

    map.addSource('lineObject', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': []
        }
    });
    map.addLayer(
        {
            id: 'routes',
            type: "line",
            source: 'lineObject',
        }
    );
    //console.log(map.getSource('lineObject'));
});



// Iterating through all the countries (in countries.js library) and appending it to countriesOutput
for (let i = 0; i < countryData.length; i++)
{
    countriesOutput += `<option value="${countryData[i]}"></option>`;
}

// Updating innerHTML to display all the countries on page
countriesRef.innerHTML = countriesOutput;

// function showAirportData(result)
// /* Function to display all the available airports in a specific country

// :pre: result is data returned from the airport API
// :post: an searchable dropdown list is created on the page with all the available airports in the specific country 
// */
// {
//     // Defining variables
//     let airportRef = document.getElementById("airport");
//     let airportSelectionOptions = ""

//     // Creating some HTML for airport input field
//     let airportInputField = `<p style="font-size:25px">Airport</p>
//     <form action="#">
//       <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
//         <input class="mdl-textfield__input" type="text" list="availableAirports" id="airportInput">
//         <label class="mdl-textfield__label" for="airportInput"></label>
//       </div>
//     </form>

//     <datalist id="availableAirports"></datalist>
//     <button onclick="getData('showMapData')">Confirm</button>`;

//     // Adding new input field for airport to page
//     airportRef.innerHTML = airportInputField;

//     // Tag reference
//     let availableAirportsRef = document.getElementById("availableAirports");

//     // Adding add the available airports to the dropdown list
//     for (let i = 0; i < result.length; i++)
//     {
//         airportSelectionOptions += `<option value="${result[i].name} (${result[i].city})"></option>`;   
//     }
    
//     // Updating innerHTML to display all the airports on page
//     availableAirportsRef.innerHTML = airportSelectionOptions;
// }

function getAirportData()
/* Function for a web service request to the airport API

:post: a web service request is made to the airport API and the callback function "showMapData"
is called with the returned data from the web service request
*/
{
    // Only execute if map is loaded
    if (!mapReady) return false;

    // Retrieve the selected country
    countrySelected = document.getElementById("countryInput").value;

    // Checking if country is selected
    if (countrySelected === "")
    {
        alert("Please provide a country input");
        return false;
    }
    
    // Creating a data variable for a web service request
    let data = {
        country: countrySelected,
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
        loadingSpinner.style.opacity = 0;
        mapReady = true;
        alert("Please select a valid country");
        return false;
    }

    // Update global vars
    airportsData = result;
    //countrySelected = result[0].country;
    

    // Get Route Data
    let url = "https://eng1003.monash/OpenFlights/allroutes/";
    let data = {
        country: countrySelected,
        callback: "showRouteData"
    }
    webServiceRequest(url, data);
}


function showRouteData(result)
{
    //console.log("\nShowing routes for "+countrySelected+"\n ");
    //console.log(result.length + " routes");

    // Update global vars
    routesData = result;


    // Only Connected
    let requiredAirports = [];
    if (document.getElementById("routeSwitch").checked)
    {
        requiredAirports = getConnectedAirports();

        // If there are no connected airports to show
        if (requiredAirports.length <= 1)
        {
            requiredAirports = airportsData;
            alert("\nNo routes found between any of the available airports.\n\nShowing all airports instead...");
        }
        console.log(requiredAirports);
    }
    else
    {
        requiredAirports = airportsData;
    }

    // Remove all current markers
    for (let i = mapMarkers.length - 1; i >= 0; i--) {
        mapMarkers[i].remove();
    }

    // Remove all current lines
    map.removeLayer("routes");
    map.removeSource("lineObject");

    // Add markers and move map accordingly
    moveMapWithMarkers(requiredAirports);

    // Add route lines to lsit
    let lineList = [];
    for(let i = 0; i < result.length; i++)
    {
        let source = getAirportById(result[i].sourceAirportId, airportsData);
        let destination = getAirportById(result[i].destinationAirportId, airportsData);

        // Valid Route?
        if (source == null || destination == null)
        {
            //console.log("Airport doesn't exist");
            continue;
        }
        else
        {
            //console.log(`Found route between ${source.name} (${source.airportId}) and ${destination.name} (${destination.airportId})`);
        }

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

    // Recreate Map Objects
    map.addSource('lineObject', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': lineList
        }
    });
    map.addLayer({
        id: 'routes',
        type: "line",
        source: 'lineObject',
        layout: { "line-join": "round", "line-cap": "round"},
        paint: { "line-color": "#444", "line-width": 2, "line-opacity": 0.65}
    });

    // Loading spinner
    loadingSpinner.style.opacity = 0;
    mapReady = true;

    // console.log("airportsData");
    // console.log(airportsData);
    // console.log("routesData");
    // console.log(routesData);
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

function getConnectedAirports()
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
        mapMarkers.push(marker);
      
        // Offsetting marker and initialing description
        let popup = new mapboxgl.Popup();
        let desc = `${result[i].name}`;
        
        // Add the marker to the map
        marker.addTo(map);

        // Attach the description to popup
        popup.setHTML(desc);

        // Attach the popup to the marker
        marker.setPopup(popup);
        
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
}