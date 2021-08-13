/** 
 * viewTripDetail.js 
 * This file contains code that runs on load for viewTripDetail.html
 */

"use strict";
let tripColour = "#b33";
let latitudes = [];
let longitudes = [];
let accountindex = getAccountIndex();
let locations = []; //global variable for Trip details

//bring user back to the page they from
function returnToMySchuledTrip()
{
    window.location = String(localStorage.getItem(TRIP_PAGE_ORIGIN_KEY));
}

//cancel the current Trip by delete this trip then bring the user back to the page they from
function cancelTrip()
{
    if(confirm("Are you sure you want to cancel this trip?"))
    {
        let index = localStorage.getItem(TRIP_INDEX_KEY);
        
        //retrive the accounts
        let data = getDataLocalStorage()
        let accounts = new AccountsList
        accounts.fromData(data)

        let i = getAccountIndex();
        accounts.accounts[i].removeTrip(index) //remove trip at the index

        alert("Trip removed");

        updateLocalStorage(accounts)

        //bring the user back to previous page
        window.location = String(localStorage.getItem(TRIP_PAGE_ORIGIN_KEY));
    
    }
}

//display the trip
function displayTrip(trips)
{

        let tripDisplay = document.getElementById("tripDetailDisplay");
    
        //output: local variable to hold the contents that will display on the HTML page.
        let output = `
        <!-- Block -->
        <br>

        <li class="mdl-list__item mdl-shadow--2dp">
          <span class="mdl-list__item-primary-content" style="position:relative; display: inline-grid; grid-template-columns: auto;">
            <span style="text-align: center"> ${trips.tripFlights[0].startDestination.name}</span>
            <span id="origin">  </span>
          </span>
          <span class="mdl-list__item-secondary-content">
          </span>
        </li>
                    
        <!-- Arrow -->
        <div class="arrowtail"></div>
        <div class="arrowhead"></div>`;
    
        //loop through all the Trips to add their information for display.
        for(let i=0 ; i<trips.tripFlights.length ; i++)
        {
            output += `
                            
            <!-- Block -->
            <li class="mdl-list__item mdl-shadow--2dp">
              <span class="mdl-list__item-primary-content" style="display: inline-grid; grid-template-columns: auto;">
                <span style="text-align: center">${trips.tripFlights[i].finalDestination.name}</span>
              </span>
              <span class="mdl-list__item-secondary-content">
              </span>
            </li>`

            if(i!==trips.tripFlights.length-1)
            {
                output +=`
                <!-- Arrow -->
                <div class="arrowtail"></div>
                <div class="arrowhead"></div>`
            }
        
        }
        tripDisplay.innerHTML = output;

        let latlng = [];

        //get the coordinates
        for (let i = 0; i < trips.tripFlights.length + 1; i++)
        {

            if (i < trips.tripFlights.length)
            {
                latlng = [trips.tripFlights[i].startDestination.longitude, trips.tripFlights[i].startDestination.latitude];
                locations.push(latlng);
                latitudes.push(trips.tripFlights[i].startDestination.latitude);
                longitudes.push(trips.tripFlights[i].startDestination.longitude);
            }
            else if (i == trips.tripFlights.length)
            {
                latlng = [trips.tripFlights[i-1].finalDestination.longitude, trips.tripFlights[i-1].finalDestination.latitude];
                locations.push(latlng);
                latitudes.push(trips.tripFlights[i - 1].finalDestination.latitude);
                longitudes.push(trips.tripFlights[i - 1].finalDestination.longitude);    
            }

            let marker = new mapboxgl.Marker({ "color": "#FF8C00" });
            marker.setLngLat(locations[i]);
            let popup = new mapboxgl.Popup({ offset: 45});
            
            if(i < trips.tripFlights.length)
            {
                popup.setHTML(`${trips.tripFlights[i].startDestination.name}`);
            }
            else 
            {
                popup.setHTML(`${trips.tripFlights[i-1].finalDestination.name}`);
            }

            
            marker.setPopup(popup);
        
            // Display the marker.
            marker.addTo(map);
        
            // Display the popup.
            popup.addTo(map);
        };

    return location;
}


//code that run on load
//if logged in, display the trip, else , return to homepage
if (accountindex != -1)
{
    let account = accounts.getAccountAtIndex(accountindex);
    let index = localStorage.getItem(TRIP_INDEX_KEY);
    let trips = account.accountTrips[index];
    displayTrip(trips);
}
else
{
    alert("You haven't login");
    window.locations.href = "signIn.html";
}

//print all the lines
map.on('load', function () {
    let object = {
        type: "geojson",
        data: {
            type: "Feature",
            properties: {},
            geometry: {
                type: "LineString",
                coordinates: []
            }
        }
    };


    for(let i = 0; i < locations.length; i++)
    {
        object.data.geometry.coordinates.push(locations[i]);
    };
    
    map.addSource('routes',object);
    map.addLayer({
        id: "route",
        type: "line",
        source: object,
        layout: { "line-join": "round", "line-cap": "round"},
        paint: { "line-color": "#b33", "line-width": 7}
    });

    // Draw circle for origin
    map.addSource("originSource", {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": locations[0]
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
            "circle-color": "#b33"
        }
    });
})

// Calcualting the extreme latitudes
let maxLat = latitudes.reduce((a, b) => Math.max(a, b));
let minLat = latitudes.reduce((a, b) => Math.min(a, b));

// Calculating the extreme longitudes, compensating for when they lie on either side of prime meridian
let longitudesSorted = longitudes.sort( (a,b) => a-b );
let maxLng = longitudesSorted[longitudesSorted.length - 1];
let minLng = longitudesSorted[0];

// Iterate through the sorted longitude values
for (let i = 1; i < longitudesSorted.length; i++)
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
