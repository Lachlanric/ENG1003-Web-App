"use strict";

// Create login function
/*
    - loop through local storage
    - compare (from the same object)
    - if both parameters match then user is "logged in"
    - if both parameters are not identical alert 
*/

function login()
{
    // Dom referencing
    let email = document.getElementById("email");
    let emailInput = email.value;

    let psw = document.getElementById("psw");
    let passwordInput = psw.value;
    
    let confirm = JSON.parse(localStorage.getItem(CONFIRM_TRIP_KEY))
    // Loop through accounts
    for(let i = 0; i < accounts.accounts.length; i++)
    {
        // check accountEmail against input
        if (accounts.accounts[i].accountEmail == emailInput)
        {
            if (accounts.accounts[i].verifyPassword(passwordInput))
            {
                updateAccountIndex(i);                          // on login, index is updated server-side
                if(confirm == true)
                {
                    localStorage.setItem(CONFIRM_TRIP_KEY, null); 
                    window.location = "confirmTripsPage.html";
                    return true;
                }
                else
                {
                window.location = "index.html";
                return true;
                }
            }
            else
            {
                err();
                return false;
            }
        }
    }
    err();
    return false;
}

function err()  // to use in place of specific errors
{
    alert ("Email or password is invalid!");
}
