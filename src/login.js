const registerURL = "registerURL";
const loginURL = "loginURL";

function register() {
    $('#form-app').html(`
        <img class="mb-4" src="./assets/img/inactive/playlist_tracker_icon_128.png" alt="" width="72" height="72">
        <h1 class="h3 mb-3 fw-normal">Please complete to register</h1>
        <div class="form-floating">
            <input type="email" class="form-control" id="email" placeholder="name@example.com">
            <label for="email">Email address</label>
        </div>
        <div class="form-floating">
            <input type="password" class="form-control" id="password" placeholder="Password">
            <label for="password">Password</label>
        </div>
        <div class="form-floating">
            <input type="password" class="form-control" id="confirmPassword" placeholder="Confirm Password">
            <label for="confirmPassword">Confirm Password</label>
        </div>
        <button class="w-100 btn btn-lg btn-primary" id="signup" type="submit">Register</button>
        <div class="container">
            <span class="container-fluid py-2">
                Already have an account? <a href="login.html" id="login">Log In</a>
            </span>
        </div>
        <p class="mt-5 mb-3 text-muted">© A Better Subscription 2023</p>
    `);

    $('form').submit(function(event) {
        event.preventDefault();
        let data = { email: $('#email').val(), password: $('#password').val() }
        console.log(`http post to: ${registerURL} with ${JSON.stringify(data)}`);
        /*
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            // Code to handle the response data
            console.log(data);
        })
        .catch(error => {
            // Code to handle errors
            console.error(error);
        }); */
    });
}

function login(event) {
    event.preventDefault();
    let data = { email: $('#email').val(), password: $('#password').val() }
    console.log(`http post to: ${loginURL} with ${JSON.stringify(data)}`);
    /*
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        // Code to handle the response data
        console.log(data);
    })
    .catch(error => {
        // Code to handle errors
        console.error(error);
    }); */
}

function init() {
    $('.register').click(register);
    $('#signin').click(login);
}

$(document).ready(function() { init(); });