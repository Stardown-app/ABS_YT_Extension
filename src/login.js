function registerForm() {
    $('#app').html(`
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
            <input type="password" class="form-control rounded" id="confirm-password" placeholder="Confirm Password">
            <label for="confirm-password">Confirm Password</label>
        </div>
        <button class="w-100 btn btn-lg btn-primary" id="register-button" type="submit">Register</button>
        <div class="container">
            <span class="container-fluid py-2">
                Already have an account? <a href="login.html" id="login">Log In</a>
            </span>
        </div>
        <div class="container" id="system"></div>
        <p class="mt-5 mb-3 text-muted">© A Better Subscription 2023</p>
    `);
    $('#email').on('input', () => { validEmail = emailRegex.test($('#email').val()); checkStrength($('#register-button')); });
    $('#register-button').prop('disabled', true);
    $('#confirm-password').prop('disabled', true);
    $('#password').on('input', () => checkStrength($('#register-button')));
    $('#confirm-password').on('input', () => validatePassword($('#register-button')));

    $('form').submit(async function(event) {
        event.preventDefault();

        $('#system').html('');
        try {
            $('#system').html(`<img class="floating-animation" src="./assets/img/loading.gif"`);
            const response = await axios.post('http://chuadevs.com:12312/v1/account/register', { email: $('#email').val(), password: $('#password').val() });
            localStorage.setItem('abs_account', JSON.stringify(response.data));
            chrome.storage.local.set({'abs_account': response.data}, () => window.location.href = 'popup.html');
        } catch(e) {
            console.log(e);
            $('#system').html(`Error Status ${e.response.status} : ${e.response.data}`);
        }
    });
}

async function login(event) {
    event.preventDefault();
    $('#system').html('');
    try {
        $('#system').html(`<img class="floating-animation" src="./assets/img/loading.gif"`);
        const response = await axios.post('http://chuadevs.com:12312/v1/account/', { email: $('#email').val(), password: $('#password').val() });
        localStorage.setItem('abs_account', JSON.stringify(response.data));
        chrome.storage.local.set({'abs_account': response.data}, () => window.location.href = 'popup.html');
    } catch(e) {
        $('#system').html(`Error Status ${e.response.status} : ${e.response.data}`);
    }
}

function loginForm() {
    $('#app').html(`
        <img class="mb-4" src="./assets/img/inactive/playlist_tracker_icon_128.png" alt="" width="72" height="72">
        <h1 class="h3 mb-3 fw-normal">Please sign in</h1>
        <div class="form-floating">
            <input type="email" class="form-control" id="email" placeholder="name@example.com">
            <label for="email">Email address</label>
        </div>
        <div class="form-floating">
            <input type="password" class="form-control" id="password" placeholder="Password">
            <label for="password">Password</label>
        </div>
        <button class="w-100 btn btn-lg btn-primary" id="signin-button" type="submit">Sign in</button>
        <div class="container">
            <span class="container-fluid py-2">
                Need an account? <a href="#" class="register">Register</a>
            </span>
        </div>
        <div class="container" id="system"></div>
        <p class="mt-5 mb-3 text-muted">© A Better Subscription 2023</p>
    `);
    $('#email').on('input', () => validateEmail($('#signin-button')) );
    $('.register').click(registerForm);
    $('#signin-button').prop('disabled', true);
    $('#signin-button').click(login);
}

function init() {
    loginForm();
    $('#app').addClass('mx-3');
}

$(document).ready(() => init());