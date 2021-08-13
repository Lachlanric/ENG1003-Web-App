"use strict";

// Keys
const TRIP_AIRPORTS_KEY = "tripAirports";
const TRIP_COUNTRY_KEY = "tripCountry";
const TRIP_DATE_KEY = "tripDate";

// Globals
let mapMarkers = [];
let tripColour = "#b33";
//let airports = [];

// Map
const MAPBOX_TOKEN = "pk.eyJ1IjoibXZhbjAwMzMiLCJhIjoiY2tnNjFyZ3dvMTAzODJ5bDBiY3A3ZGg0ZSJ9.b9034FWO_ALWaZvBd_k77w";
mapboxgl.accessToken = MAPBOX_TOKEN;

// Creating an mapboxgl.Map object
let map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11", // stylesheet location
    center: [133, -27],//[-74.5, 40], // starting position [lng, lat]
    zoom: 3.4 // starting zoom
});

// Get trip data
let airports = JSON.parse(localStorage.getItem(TRIP_AIRPORTS_KEY));
let countrySelected = localStorage.getItem(TRIP_COUNTRY_KEY);
let date = new Date(localStorage.getItem(TRIP_DATE_KEY));

map.on('load', function(){
    // Validation
    if (!(airports == null || countrySelected == null || date == null))
    {
        displayTripOnMap(airports);
    }
})


// Moves the map and adds markers based on a list of airports
function displayTripOnMap(result)
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

        // Popup
        let popup = new mapboxgl.Popup({ closeOnClick: false });
        // Attach the description to popup
        popup.setHTML(`${result[i].name}`);

        // Attach the popup to the marker
        marker.setPopup(popup);
      
        marker.addTo(map);
        popup.addTo(map);

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


    // Display route line
    // Show current trip on map
    let tripArrayCoords = [];
    for(let i = 0; i < result.length; i++)
    {
        // let airport = result[i];
        // tripArrayCoords.push([airport.longitude, airport.latitude]);

        let airport = result[i]

        console.log("tripArrayCoords");
        console.log(tripArrayCoords);

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
    let airport = result[0];

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

    updateSidePanel();
}

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


function updateSidePanel()
{
    let output = "";

    // No routes added
    if (airports.length == 0)
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
        for(let i = 0; i < airports.length; i++)
        {

            if (i == 0)
            {
                output += `
                    <li class="mdl-list__item mdl-shadow--2dp">
                        <span class="mdl-list__item-primary-content" style="padding:1vw; position:relative; display: inline-grid; grid-template-columns: auto;">
                        <span>${ airports[i].name }</span>
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
                        <span>${ airports[i].name }</span>
                        </span>
                    </li>
                `;
            }
        }
    }

    document.getElementById("sidePanel").innerHTML = output;
}

function editTrip()
{
    window.location = "planTripPage.html";
}

function discardTrip()
{
    if (confirm("Are you sure you want to delete this trip forever?"))
    {
        clearTripData();
        window.location = "index.html";
    }
}

function saveTrip()
{
    // If logged in
    if (isLoggedIn())
    {
        let acc = getAccountIndex();

        // Create new trip object
        let trip = new Trips
        trip._tripCountry = countrySelected;

        // Create and append flights
        for (let i = 1; i < airports.length; i++)
        {
            let flight = new Flight(airports[i-1], airports[i], date);
            trip.appendFlight(flight);
        }
        // Add the new trip, update local storage, and go to shcedule trips page
        accounts.getAccountAtIndex(acc).addAccountTrip(trip);
        updateLocalStorage(accounts);
        clearTripData();
        window.location = "scheduledTripsPage.html";
    }
    else
    {
        if (confirm("You must be signed in to save a trip. Would you like to sign in?"))
        {
            localStorage.setItem(CONFIRM_TRIP_KEY,true);
            window.location = "signIn.html";
        }
    }
}


function clearTripData()
{
    localStorage.setItem(TRIP_AIRPORTS_KEY, null);
    localStorage.setItem(TRIP_COUNTRY_KEY, null);
    localStorage.setItem(TRIP_DATE_KEY, null);
}