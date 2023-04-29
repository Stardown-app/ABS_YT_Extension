async function login(event) {
    event.preventDefault();
    try {
        $('#system').html(`<img id="floating-animation" src="./assets/img/loading-200.gif">`);
        $('#signin-button').prop('disabled', true);
        const response = await axios.post('http://chuadevs.com:12312/v1/account/', { email: $('#email').val(), password: $('#password').val() });
        localStorage.setItem('abs_account', JSON.stringify(response.data));
        chrome.storage.local.set({'abs_account': response.data}, () => window.location.href = 'popup.html');
    } catch(e) {
        $('#system').html(`Error Status ${e.response.status} : ${e.response.data}`);
        $('#signin-button').prop('disabled', false);
    }
}

function loginForm() {
    $('#app').html(`
        <img class="mb-4 animate__animated animate__lightSpeedInRight" src="./assets/img/inactive/playlist_tracker_icon_128.png" alt="" width="72" height="72">
        <h1 class="h3 mb-3 fw-normal animate__animated animate__lightSpeedInRight">Please sign in</h1>
        <div class="form-floating animate__animated animate__lightSpeedInRight">
            <input type="email" class="form-control" id="email" placeholder="name@example.com">
            <label for="email">Email address</label>
        </div>
        <div class="form-floating animate__animated animate__lightSpeedInRight">
            <input type="password" class="form-control" id="password" placeholder="Password">
            <label for="password">Password</label>
        </div>
        <button class="mt-2 w-100 btn btn-lg btn-primary animate__animated animate__lightSpeedInRight" id="signin-button" type="submit">Sign in</button>
        <div class="container animate__animated animate__lightSpeedInRight">
            <span class="container-fluid py-2">
                Need an account? <a href="#" class="register">Register</a>
            </span>
        </div>
    `);
    $('#email').on('input', () => validateEmail($('#signin-button')) );
    $('.register').click(registerForm);
    $('#signin-button').prop('disabled', true);
    $('#signin-button').click(login);
}

async function register(event) {
    event.preventDefault();
    try {
        $('#system').html(`<img id="floating-animation" src="./assets/img/loading-200.gif">`);
        $('#register-button').prop('disabled', true);
        const response = await axios.post('http://chuadevs.com:12312/v1/account/register', { email: $('#email').val(), password: $('#password').val() });
        localStorage.setItem('abs_account', JSON.stringify(response.data));
        chrome.storage.local.set({'abs_account': response.data}, () => window.location.href = 'popup.html');
    } catch(e) {
        $('#register-button').prop('disabled', false);
        $('#system').html(`Error Status ${e.response.status} : ${e.response.data}`);
    }
}

function registerForm() {
    $('#app').html(`
        <img class="mb-4 animate__animated animate__lightSpeedInRight" src="./assets/img/inactive/playlist_tracker_icon_128.png" alt="" width="72" height="72">
        <h1 class="h3 mb-3 fw-normal animate__animated animate__lightSpeedInRight">Please complete to register</h1>
        <div class="form-floating animate__animated animate__lightSpeedInRight">
            <input type="email" class="form-control" id="email" placeholder="name@example.com">
            <label for="email">Email address</label>
        </div>
        <div class="form-floating animate__animated animate__lightSpeedInRight">
            <input type="password" class="form-control" id="password" placeholder="Password">
            <label for="password">Password</label>
        </div>
        <div class="form-floating animate__animated animate__lightSpeedInRight">
            <input type="password" class="form-control rounded" id="confirm-password" placeholder="Confirm Password">
            <label for="confirm-password">Confirm Password</label>
        </div>
        <button class="mt-2 w-100 btn btn-lg btn-primary animate__animated animate__lightSpeedInRight" id="register-button" type="submit">Register</button>
        <div class="container animate__animated animate__lightSpeedInRight">
            <span class="container">
                Already have an account? <a href="login.html" id="login">Log In</a>
            </span>
        </div>
    `);
    $('#email').on('input', () => { validEmail = emailRegex.test($('#email').val()); checkStrength($('#register-button')); });
    $('#register-button').prop('disabled', true);
    $('#confirm-password').prop('disabled', true);
    $('#password').on('input', () => checkStrength($('#register-button')));
    $('#confirm-password').on('input', () => validatePassword($('#register-button')));
    $('form').submit(register);
}

function init() {
    $('#app').addClass('mx-3');
    loginForm();
    footer();
}

$(document).ready(() => init());