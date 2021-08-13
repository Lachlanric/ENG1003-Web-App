"use strict"



// Called when user clicks on a scheduled trip
function viewTrip(index)
{
    // Stores trip index at TRIP_INDEX_KEY
    localStorage.setItem(TRIP_INDEX_KEY, index);

    // Stores current page at PAGE_ORIGIN_KEY
    localStorage.setItem(TRIP_PAGE_ORIGIN_KEY, getPage()); // from https://stackoverflow.com/questions/16611497/how-can-i-get-the-name-of-an-html-page-in-javascript
    
    // Directs the user to tripDetailsPage.html
    window.location = "tripDetailsPage.html";
}



// Button Style
// Causes the colour of the button to change when moused over
function mouseOver(ref)
{
    ref.style.background = "#eeeeee";
}
function mouseLeave(ref)
{
    ref.style.background = "#ffffff";
}



// ON PAGE STARUP



/* // TEMPORARY SIGNED IN ACCOUNT WITH TEMPORARY TRIP (if no data exists. in practice data will always exist when viewing this page)
if ( !(checkIfDataExistsLocalStorage()) || !(isLoggedIn()) )
{
    console.log("created temp");
    let tempAccount = new Account("Temp");
    let tempTrip = new Trips("Australia", [new Flight("Melb Airport","Adelaide Airport",new Date(),"FLIGHTID1"),new Flight("Adelaide Airport","Perth Airport",new Date(),"FLIGHTID2")] );
    tempAccount.addAccountTrip(tempTrip);
    accounts.addAccount(tempAccount);
    localStorage.setItem(ACCOUNT_INDEX_KEY, 0);
    updateLocalStorage(accounts);
}
else
{
    console.log("didn't create temp");
}*/


// DISPLAY TRIP LIST

// Retrieve list of trips from the account that is signin in
let accIndex = localStorage.getItem(ACCOUNT_INDEX_KEY);
let trip_list = accounts.getAccountAtIndex(accIndex).accountTrips;
//console.log(trips);

let trips = trip_list.sort(function(a, b){return a.tripStartDate-b.tripStartDate});


let output = "";
let size = 80; // quick way to alter the size of the trip blocks on the page (for testing only)



// Create trip blocks
for(let i = 0; i < trips.length; i++)
{
    // Retrieve Trip Details
    let country = trips[i].tripCountry;
    let origin = trips[i].tripStartLocation.name;
    let destination = trips[i].tripDestination.name;
    let time = trips[i].tripStartDate.toLocaleDateString();

    let today = new Date().getTime();
    let currentDate = trips[i].tripStartDate.getTime();

    if ( (getPage() == "scheduledTripsPage.html" && currentDate < today) || (getPage() == "previousTripsPage.html" && currentDate >= today) ){
        continue;
    }

    // // Convert Airports
    // origin = origin.name;
    // destination = destination.name;

    // Display Trip Details
    output += `
    <li class="mdl-list__item mdl-shadow--4dp" style="cursor:pointer; background-color:white; border-radius: ${size}px; height:${size+30}px" onmouseover="mouseOver(this)" onmouseleave="mouseLeave(this)" onclick="viewTrip(${i})">
        
        <span style="text-align: center">
            <i class="material-icons mdl-list__item-avatar" style="height:${size}px; width:${size}px; font-size: ${size}px;">flight</i>
        </span>
        <span class="mdl-list__item-text-body" style="padding-left:30px">
            <p><b style="font-size: x-large;">${country}</b></p>
            <div style="font-size: large; display:inline-grid; grid-template-columns: auto auto auto; grid-column-gap: 5vw">
                <span> <span class="material-icons" style="transform: translateY(${Math.floor(size/15)}px);">flight_takeoff</span> ${origin} </span>
                <span> <span class="material-icons" style="transform: translateY(${Math.floor(size/15)}px);">room</span> ${destination} </span>
                <span> <span class="material-icons" style="transform: translateY(${Math.floor(size/15)}px);">schedule</span> ${time} </span>
            </div>
        </span>
        
        
    </li> <br>
    `;
}
let listRef = document.getElementById("tripList");
listRef.innerHTML = output;







/* Generate List
let listRef = document.getElementById("tripList");
let output = "";
let numTrips = 10;
let size = 80;

for(let i = 1; i <= numTrips; i++)
{
    output += `
    <li class="mdl-list__item mdl-shadow--4dp" style="cursor:pointer; background-color:white; border-radius: ${size}px; height:${size+30}px" onmouseover="mouseOver(this)" onmouseleave="mouseLeave(this)" onclick="viewTrip(${i})">
        
        <span style="text-align: center">
            <i class="material-icons mdl-list__item-avatar" style="height:${size}px; width:${size}px; font-size: ${size}px;">flight</i>
        </span>
        <span class="mdl-list__item-text-body" style="padding-left:30px">
            <p><b style="font-size: x-large;">Trip ${i}: Country Name</b></p>
            <div style="font-size: large; display:inline-grid; grid-template-columns: auto auto auto; grid-column-gap: 8vw">
                <span> <span class="material-icons" style="transform: translateY(${Math.floor(size/15)}px);">flight_takeoff</span> Airport A </span>
                <span> <span class="material-icons" style="transform: translateY(${Math.floor(size/15)}px);">room</span> Airport Z </span>
                <span> <span class="material-icons" style="transform: translateY(${Math.floor(size/15)}px);">schedule</span> dd/mm/yy </span>
            </div>
        </span>
        
        
    </li> <br>
    `;
}

listRef.innerHTML = output;
*/



/* PREVIOUS TRIP LOOK
<li class="mdl-list__item mdl-shadow--4dp" style="cursor:pointer; background-color:white; border-radius: ${size}px; height:${size+30}px" onmouseover="mouseOver(this)" onmouseleave="mouseLeave(this)" onclick="viewTrip(${i})">
        
        <span style="text-align: center">
            <i class="material-icons mdl-list__item-avatar" style="height:${size}px; width:${size}px; font-size: ${size}px;">flight</i>
        </span>
        <span class="mdl-list__item-text-body" style="padding-left:30px">
            <p><b style="font-size: xx-large;">Trip ${i}: Country Name</b></p>
            <div style="font-size: large; display:inline-grid; grid-template-columns: auto auto auto; grid-column-gap: 2vw">
                <span>Origin: ________</span>
                <span>Destination: ________</span>
                <span>Date of Departure: ________</span>
            </div>
        </span>
        
        <div class="mdl-layout-spacer"></div>
        <span class="mdl-list__item-secondary-content" style="height:${size}px">
            <a class="mdl-list__item-secondary-action" href="">
                <button class="mdl-button mdl-js-button mdl-button--primary" style="height:${size}px; border-radius: ${size+30}px; font-size: x-large;">
                    View Details
                </button>
            </a>
        </span>
        
        
    </li> <br>
*/