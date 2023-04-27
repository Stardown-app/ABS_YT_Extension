const account = JSON.parse(localStorage.getItem('abs_account'));

function accountOptions() {
    $('#app').html(`<br><br><center>
        <div class="btn-group mr-1" role="group" aria-label="Button group with four buttons">
            <button type="button" class="btn btn-secondary border" data-bs-toggle="tooltip" data-bs-placement="top" title="this feaure coming soon!" id="email-button">Update email</button>
            <button type="button" class="btn btn-secondary border" id="password-button">Update password</button>
            <button type="button" class="btn btn-secondary border" id="metrics-button">Account metrics</button>
        </div>
    </center>`);
    footer();
    $('#password-button').click(passwordUpdate);
    $('#metrics-button').click(dashboard);
    $('[data-bs-toggle="tooltip"]').tooltip();
}

function currentInfo() {
    $('#app').html(`<form id="update-form">
        <img class="mb-4" src="./assets/img/inactive/playlist_tracker_icon_128.png" alt="" width="72" height="72">
        <h1 class="h3 mb-3 fw-normal">Please provide the following</h1>
        <div class="form-floating">
            <input type="email" class="form-control" id="email" placeholder="name@example.com">
            <label for="email">Your current account email address</label>
        </div>
        <div class="form-floating">
            <input type="password" class="form-control" id="password" placeholder="Password">
            <label for="password">Password</label>
        </div>
        <button class="w-100 btn btn-lg btn-primary" id="next-button">Next</button>
        <div class="container" id="system"></div>
    </form>`);
    footer();
    $('#update-form').addClass('mx-3 text-center form-signin');
    $('#next-button').prop('disabled', true);
}

function dashboard() {
    let contentSize = 0;
    $('#app').html(`<div class="container">
    <div class="row rounded card-bg-primary text-light mt-2" style="margin-right:10px">
        <div class="col-sm-4">
            <div class="rounded card-bg-secondary text-light p-1 my-3">
                <p class="small fw-bold">No. of playlists</p>
                <p class="text-center lead">${account.playlists.length}</p>
            </div>
        </div>
        <div class="col-sm-4">
            <div class="rounded card-bg-secondary text-light p-1 my-3">
                <p class="small fw-bold">Actions (all time)</p>
                <p class="text-center lead">${account.actions}</p>
            </div>
        </div>
        <div class="col-sm-4">
            <div class="rounded card-bg-secondary text-light p-1 my-3">
                <p class="small fw-bold">Size (all contents)</p>
                <p class="text-center lead" id="contents-size"></p>
            </div>
        </div>
    </div>
    
    <div class="row playlists pt-2">
    </div>
    </div>`);
    for(let i = 0; i < account.playlists.length; i++) {
        contentSize += account.playlists[i].contents.length;
        $('.playlists').append(`
            <div class="row rounded card-bg-primary text-light p-3 mb-2">
                <div class="col-sm-12">
                    <div class="rounded card-bg-secondary p-2 mb-3">
                        <p class="small fw-bold">Playlist Title</p>
                        <p class="text-center lead">${account.playlists[i].playlist_title}</p>
                    </div>
                </div>
                <div class="col-sm-6">
                    <div class="rounded card-bg-secondary p-2">
                        <p class="small fw-bold">Size</p>
                        <p class="text-center lead">${account.playlists[i].contents.length}</p>
                    </div>
                </div>
                <div class="col-sm-6">
                    <div class="rounded card-bg-secondary p-2">
                        <p class="small fw-bold">Actions</p>
                        <p class="text-center lead">${account.playlists[i].clicked}</p>
                    </div>
                </div>
            </div>
        `);
    }
    $('#contents-size').html(`${contentSize}`);
}

function emailUpdate() {
    // future feature implementation
}

function footer() {
    $('#app').append(`<br><center><hr>
    <div class="container" id="system"></div>
    <p class="mt-2 mb-2 text-muted">© A Better Subscription 2023</p>
    </center>`);
}

function main() {
    $('body').html(`
        <nav class="navbar navbar-light" style="background-color: #eef1ef;">
            <div class="container-fluid">
                <a class="navbar-brand me-auto" href="#">
                    <img src="/assets/img/inactive/playlist_tracker_icon_32.png">
                </a>
                <button class="navbar-toggler collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarCollapse">
                    <ul class="navbar-nav"></ul>
                </div>
            </div>
        </nav>   
        <div id="app"></div>
    `);
    nav();
    accountOptions();
}

function nav() { 
    $('.navbar-nav').html(`
            <li class="nav-item ms-auto">
                <a class="nav-link" href="#" id="playlist-manager">Playlist Manager</a>
            </li>
            <li class="nav-item ms-auto">
                <a class="nav-link" href="#" id="playlist-view">Return to Playlists</a>
            </li>
            <li class="nav-item ms-auto">
                <a class="nav-link" href="#" id="log-off">Log off</a>
            </li>
    `);
    $('#log-off').click(async function() { 
        try {
            await axios.put('http://chuadevs.com:12312/v1/account/sync', account);
            localStorage.removeItem('abs_account');
            await chrome.storage.local.remove('abs_account', () => { location.reload(); })
        } catch(e) {
            $('#system').html(e.message);
        }
    });
    $('#playlist-manager').click(() => window.location.href = 'playlists.html');
    $('#playlist-view').click(() => window.location.href = 'popup.html');
}

function passwordUpdate() {
    currentInfo();
    $('#next-button').click(() => newPassword($('#email').val(),$('#password').val()));
    $('#email').on('input', () => validateEmail($('#next-button')) );
}

function newPassword(email, oldPassword) {
    $('#update-form').html(`
    <div class="form-floating mt-2">
        <input type="password" class="form-control rounded" id="password" placeholder="Password">
        <label for="password">New Password</label>
    </div>
    <div class="form-floating">
        <input type="password" class="form-control rounded" id="confirm-password" placeholder="Confirm Password">
        <label for="confirm-password">Confirm Password</label>
    </div>
    <button class="w-100 btn btn-lg btn-primary" id="submit-button" type="submit">Submit</button>
    `);
    $('#submit-button').prop('disabled', true);
    $('#confirm-password').prop('disabled', true);
    $('#password').on('input', () => checkStrength($('#submit-button')));
    $('#confirm-password').on('input', () => validatePassword($('#submit-button')));

    $('form').submit(async function(event) {
        event.preventDefault();
        try {
            account.actions += 1;
            $('#submit-button').prop('disabled', true);
            $('#system').html(`<img src="./assets/img/loading.gif" id="floating-animation">`);
            await axios.put('http://chuadevs.com:12312/v1/account', { email: email, password: oldPassword, new_email: undefined, new_password: $('#password').val()});
            $('#system').append('Update successful! Returning to your playlists page');
            setTimeout(() => window.location.href = 'popup.html', 2500);
        } catch(e) {
            $('#system').html(e.response.data);
        }
    });
}

$(document).ready(() => main());