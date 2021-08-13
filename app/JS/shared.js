/* File that contains all the classes and functions to be used across all the webpages for the Planning Flights web application */ 
"use strict";

// Local storage keys
const ACCOUNT_DATA_KEY = "localAccountData";
const ACCOUNT_INDEX_KEY = "selectedAccountIndex";
const TRIP_INDEX_KEY = "tripIndex"; // Key to store the index of the trip that was just clicked on
const TRIP_PAGE_ORIGIN_KEY = "tripPageOrigin";  // Key to store the page that the user came from when moving to Trip Details Page
const CONFIRM_TRIP_KEY = "cameFromConfirmTripsPage";



class Account
/* Class for containing all the information of a user (name, email, password, trips they have planned). Contains an array of
 trips */
{
    constructor(accountName="", accountEmail="", accountPassword="")
    /* Method for initalising the Account class 

    :pre: "accountName", "accountEmail" & "accountPassword" are strings (default values of "")
    :post: Account class is instantiated with accountName, accountEmail, accountPassword & accountTrips set as attributes.
    accountTrips is set as an empty array.
    */
    {
        this._accountName = accountName;
        this._accountEmail = accountEmail;
        this._accountPassword = accountPassword;
        this._accountTrips = [];
    }

    // Accessors for the class
    get accountName()
    {
        return this._accountName;
    }
    get accountEmail()
    {
        return this._accountEmail;
    }
    /*
    get accountPassword()
    {
        return this._accountPassword;
    }
    */
    get accountTrips()
    {
        return this._accountTrips;
    }


    // Mutators for the class
    set accountName(newName)
    {
        this._accountName = newName;
    }
    
    set accountEmail(newEmail)
    {
        this._accountEmail = newEmail;
    }

    

    verifyPassword(password)
    /* Method for verifying if a entered password is correct.
    
    :pre: password is string
    :returns: Returns true if password is correct otherwise false
     */
    {
        return password === this._accountPassword;
    }

    addAccountTrip(trip)
    /* Method for adding a trip to a specific Account class

    :pre: trip is an instance of the Trip class 
    :post: _accountTrips attribute (array) is appended with "trip"
    */
    {
        this._accountTrips.push(trip);
    }
    
    removeTrip(index)
    /* Method for removing the trip on given index that a specific user went on

    :post: _accountTrips attribute (array) is modified such that the last element (trip) has been removed
    */
    {
        this._accountTrips.splice(index,1);
    }

    fromData(data)
    /* Method for restoring a class instance of Account that has been retrieved from local storage

    :pre: data is an Account object although it is not an instance of the Account class
    :post: the new class instance of Account contains all the attributes as specified by "data"
    */
    {
        this._accountName = data._accountName;
        this._accountEmail = data._accountEmail;
        this._accountPassword = data._accountPassword;
        this._accountTrips = [];

        // Restoring the Trips within accountTrips
        let tripsArray = data._accountTrips;
        for (let i = 0; i < tripsArray.length; i++)
        {
            let newTrip = new Trips();
            newTrip.fromData(tripsArray[i]);
            this._accountTrips.push(newTrip);
        }
    }
}

class AccountsList
/* Class for containing all of the stored Accounts on the webpage (an array of Accounts) */
{
    constructor()
     /* Method for initalising the AccountsList class 

    :post: AccountsList class is instantiated with the attribute account set to an empty array
    */
    {
        this._accounts = [];
    }

    get accounts() 
    {
        return this._accounts;
    }

    getAccountAtIndex(index)
    {
        return this._accounts[index];
    }
    
    retrieveAccount(accountName)
    /* Method for retrieving an account with a specific account name

    :pre: accountName is a string
    :post: prints "Error account not found" to console if accountName is not associated with an Account in the _account array
    :returns: the Account with attribute accountName equal to the parameter "accountName"
    */
    {
        for (let i = 0; i < this._accounts.length; i++)
        {
            if (this._accounts[i].accountName === accountName)
            {
                return this._accounts[i];
            }
        }
        console.log("Error account not found");
    }

    addAccount(account)
    /* Method for adding an account to the AccountsList class

    :pre: "account" is an instance of the Account class
    :post: the AccountsList attribute _accounts is appended with "account"
    */
    { 
        this._accounts.push(account);
    }

    // removeAccount(accountName)
    // /* Method for removing an account from the AccountsList class

    // :pre: "accountName" is a string
    // :post: removes the account with attribute accountName equal to "accountName" from the AccountsList class attribute _accounts 
    // (array) otherwise prints "Error account not found" to console if accountName is not associated with an Account in the _account
    // array
    // */
    // {
    //     for (let i = 0; i < this._numberAccounts; i++)
    //     {
    //         if (this._accounts[i].accountName === accountName)
    //         {
    //             this._accounts.splice(i, 1);
    //             return null; 
    //         }
    //     }
    //     console.log("Error account not found");
    // }

    fromData(data)
    /* Method for restoring a class instance of AccountsList that has been retrieved from local storage

    :pre: data is an AccountsList object although it is not an instance of the AccountsList class
    :post: the new class instance of AccountsList contains all the attributes as specified by "data"
    */
    {
        this._accounts = [];
        let accountArray = data._accounts;
        
        for (let i = 0; i < accountArray.length; i++)
        {
            let newAccount = new Account();
            newAccount.fromData(accountArray[i]);
            this._accounts.push(newAccount);
        }
    }
}

class Flight
/* Class for containing all the infomation of a specific flight (start destination, final destination, flight start time, flight 
ID) */
{
    constructor(startDestination="", finalDestination="", flightStartTime=new Date)
    /* Method for initalising the Flight class 

    :pre: startDestination, finalDestination, flightID are strings (default values of "")
    :pre: flightStartTime is a class instance of Date (default value of new Date())
    :post: Flight class is instantiated with startDestination, finalDestination, flightStartTime & flightID set as attributes
    */
    {
        this._startDestination = startDestination;
        this._finalDestination = finalDestination;
        this._flightStartTime = flightStartTime;
    }

    // Accessors
    get flightStartTime()
    {
        return this._flightStartTime;
    }

    get finalDestination()
    {
        return this._finalDestination;
    }

    get startDestination()
    {
        return this._startDestination;
    }

    fromData(data)
    /* Method for restoring a class instance of Flight that has been retrieved from local storage

    :pre: data is an Flight object although it is not an instance of the Flight class
    :post: the new class instance of Flight contains all the attributes as specified by "data"
    */
    {
        this._startDestination = data._startDestination;
        this._finalDestination = data._finalDestination;
        this._flightStartTime = new Date();
        this._flightStartTime.setTime(Date.parse(data._flightStartTime));
    }
}

class Trips
/* Class for containing all of the stored Trips (an array of flights) */
{
    constructor(tripCountry, tripFlights=[])
    /* Method for initalising the Trips class (an array of flights)

    :pre: tripFlights is an array (default value is empty array)
    :post: Trips class is instantiated with the attribute account set to "tripFlights"
    */
    {
        this._tripFlights = tripFlights;
        this._tripCountry = tripCountry;
    }

    // Accessors
    get tripStartLocation()
    {
        // Check if array is empty
        if (this._tripFlights.length > 0)
        {
            return this._tripFlights[0].startDestination;
        }
        else
        {
            return null;
        }
    }

    get tripDestination()
    {
        // Check if array is empty
        if (this._tripFlights.length > 0)
        {
            return this._tripFlights[this._tripFlights.length - 1].finalDestination;
        }
        else
        {
            return null;
        }
    }

    get tripFlights()
    {
        return this._tripFlights;
    }

    get tripStartDate()
    {
        // Check if array is empty
        if (this._tripFlights.length > 0)
        {
            return this._tripFlights[0].flightStartTime;
        }
        else
        {
            return null;
        } 
    }

    get tripCountry()
    {
        return this._tripCountry;
    }

    appendFlight(flight)
    /* Method for adding an flight to the Trips class

    :pre: "flight" is an instance of the Flight class
    :post: the Trips attribute _tripFlights is appended with "flight"
    */
    {
        this._tripFlights.push(flight);
    }

    removeFlight(index)
    /* Method for removing a flight from the Trips class
    
    :pre: "index" is an integer between 0 and _tripFlights.length - 1
    :post: removes the flight at index "index" from the Trips class attribute _tripFlights (array). If the index is invalid,
    prints "Error account not found" to console 
    */
    {
        if (index < 0 || index >= this._tripFlights.length)
        {
            console.log("Error invalid index");
        }
        this._tripFlights.splice(index, 1);
    }

    previousTrip(trip)
    /* Method for checking if a trip is current or previous (has already happened)
    
    :pre: "trip" is a class instance of Trip
    :returns: true if trip is in the past otherwise false
    */
    {
        let currentDate = new Date();
        return currentDate.getTime() > trip.tripFlights[trip.tripFlights.length - 1].flightStartTime.getTime();
    }

    fromData(data)
    /* Method for restoring a class instance of Trips that has been retrieved from local storage

    :pre: data is an Trips object although it is not an instance of the Trips class
    :post: the new class instance of Trips contains all the attributes as specified by "data"
    */
    {
        this._tripCountry = data._tripCountry;
        this._tripFlights = [];
        let flightsArray = data._tripFlights;

        for (let i = 0; i < flightsArray.length; i++)
        {
            let newFlight = new Flight();
            newFlight.fromData(flightsArray[i]);
            this._tripFlights.push(newFlight);
        }
    }
}


function checkIfDataExistsLocalStorage()
/* Function to check if local storage exists

:returns: true if local storage exists otherwise false
*/
{
    let data = localStorage.getItem(ACCOUNT_DATA_KEY);
    if (data === null || data === "null" || data === "undefined" || data === "")
    {
        return false;
    }
    else
    {
        return true;
    }
}

function updateLocalStorage(data)
/* Function to update local storage with "data"

:pre: data is a class instance of AccountsList
:post: local storage is updated with "data" at key ACCOUNT_DATA_KEY
*/
{
    let dataString = JSON.stringify(data);
    localStorage.setItem(ACCOUNT_DATA_KEY, dataString);
}

function getDataLocalStorage()
/* Function to get locker data from local storage

:returns: data stored in local storage at key ACCOUNT_DATA_KEY
*/
{
    return JSON.parse(localStorage.getItem(ACCOUNT_DATA_KEY));
}

// Updates the local storage key for the account that is currnetly signed in
function updateAccountIndex(index)
{
    localStorage.setItem(ACCOUNT_INDEX_KEY, index);
}

// Gets the local storage key for the account that is currnetly signed in
function getAccountIndex()
{
    return Number(localStorage.getItem(ACCOUNT_INDEX_KEY));
}

// User is "logged out" when ACCOUNT_INDEX_KEY is -1
// Checks if the user is logged in
function isLoggedIn()
{
    return (getAccountIndex() != -1);
}

// Logs the user out and returns to home page
function logout()
{
    updateAccountIndex(-1);
    window.location = "index.html";
}

// Creating a global variable for all the trips
let accounts = new AccountsList();

// Check if local storage is available
if (typeof(Storage) !== "undefined")
{
    // Check if data exists in local storage
    if (checkIfDataExistsLocalStorage())
    {
        let data = getDataLocalStorage();
        accounts.fromData(data);
    }
    // If no data exists, initialise the required keys
    else
    {
        updateAccountIndex(-1);    // No account is logged in by default
    }
}

function button()
{   
    
    let button1 = document.getElementById("placeholder1");
    let button2 = document.getElementById("placeholder2");
    if (isLoggedIn() == false)
    {
        button1.innerHTML = `<form action="signUp.html"><button class="mdl-navigation__link; buttonHeader" >Sign Up</button></form>`;
        button2.innerHTML = `<form action="signIn.html"><button class="mdl-navigation__link; buttonHeader" >Login</button></form>`;
    }
    else
    {
        button1.innerHTML = "";
        button2.innerHTML = `<form action="index.html"><button class="mdl-navigation__link; buttonHeader" onclick="logout()">Log Out</button></form>`;
    }
}

// Returns the name of the current html file as a string
function getPage()
{
    return location.pathname.substring(location.pathname.lastIndexOf("/") + 1);
}

// Grey out invalid links
if (!isLoggedIn())
{
    let navInd = 1;
    if (getPage() == "signIn.html" || getPage() == "signUp.html")
    {
        navInd = 0;
    }
    let L1 = document.getElementsByClassName("mdl-navigation")[navInd].childNodes[5];
    let L2 = document.getElementsByClassName("mdl-navigation")[navInd].childNodes[7];
    
    L1.style.pointerEvents = "none";
    L1.style.color = "#ccc";
    L2.style.pointerEvents = "none";
    L2.style.color = "#ccc";
}

// Clear trip data from home page
if (getPage() == "index.html")
{
    const TRIP_AIRPORTS_KEY = "tripAirports";
    const TRIP_COUNTRY_KEY = "tripCountry";
    const TRIP_DATE_KEY = "tripDate";
    localStorage.setItem(TRIP_AIRPORTS_KEY, null);
    localStorage.setItem(TRIP_COUNTRY_KEY, null);
    localStorage.setItem(TRIP_DATE_KEY, null);
}