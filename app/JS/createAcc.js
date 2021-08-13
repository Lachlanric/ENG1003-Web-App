"use strict"

    // Some variables

    // Create account
/* Create a class instance and add to local storage.
    - Validate email, name, password
    - Email must exist @[something]
    - Name is a string and only letters - display name on app only?
    - Password must:
        - have more than 5 characters

*/


function addNewAccount()
{   
    // Reference variables (to ref in DOMS)
    let nameInput = document.getElementById("name");
    let inputName = nameInput.value;

    let pswInput = document.getElementById("psw");
    let inputPsw = pswInput.value;
    
    let confirmPsw = document.getElementById("confirmPsw");
    let Confirm = confirmPsw.value;

    let emailInput = document.getElementById("email");
    let inputEmail = emailInput.value;

    let newAccount = new Account(inputName,inputEmail,inputPsw);
    let confirm = JSON.parse(localStorage.getItem(CONFIRM_TRIP_KEY))

        // Calling the validation functions
        if (nameValidation(inputName) && emailValidation(inputEmail) && pswValidation(inputPsw, Confirm))
        {   
            accounts.addAccount(newAccount); 
            updateLocalStorage(accounts);
            updateAccountIndex(accounts.accounts.length - 1);
            if(confirm==true)      // check if user came from confirmTripsPage.html
            {
                localStorage.setItem(CONFIRM_TRIP_KEY, null); 
                window.location = "confirmTripsPage.html";
                return true;
            }
            else
            {
            window.location = "index.html";
            }
        }
}

// Name validation
/*
    - If the name is only letters return true and record
    - If name is not then return false and alert.
*/
function nameValidation(inputName)
{   
    let letters = /^[A-Za-z]+$/;

    if (inputName.match(letters))
    {
        return true;
    }
    else
    {
        alert("Name must be only letters");
        return false;
    }
}

// Email validation
/*
    - If email is valid:
        .record
    - If not return false and alert
*/
function emailValidation(inputEmail) 
{

    let mailFormat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    
    if (inputEmail.match(mailFormat))
    {
        return true;
    }
    else
    {
        alert("Email is invalid!")
        return false
    }
}

// Password validation
/*
    - If password is greater than 8 characters:
        .return true
        .record password
    - If not valid then return false and alert
*/
function pswValidation(inputPsw, Confirm)
{

    let pswLength = inputPsw.length;

    if(pswLength <= 5)
    {
        alert("Password have greater than 5 characters");
        return false;
    }
    else if (inputPsw != Confirm)
    {
        alert("Passwords do not match!");
        return false;
    }
    else
    {
        return true;   
    }
}

