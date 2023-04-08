const account = JSON.parse(localStorage.getItem('abs_account'));
//chrome.storage.local.get('abs_account', result => { account = result.abs_account; })

function playlistManager() {
    $('#app').html(`
        <div class="row align-items-md-stretch justify-content-center p-5">
            <div class="col-md-6 mx-auto p-1">
                <button class="btn btn-outline-secondary button-container" type="button" id="subscribe-button">Subscribe to a playlist</button>
            </div>
            <div class="col-md-6 mx-auto p-1">
                <button class="btn btn-outline-secondary button-container" type="button" id="update-name-button">Update a playlist's name</button>
            </div>
            <div class="col-md-6 mx-auto p-1">
                <button class="btn btn-outline-secondary button-container" type="button" id="content-button">Manage playlist content</button>
            </div>
        </div>
    `);
    $('#subscribe-button').click(subscribe);
    $('#update-name-button').click(updatePlaylistName);
    $('#content-button').click(contentManager);
}

function subscribe() {
    $('#app').html(`
        <div class="container p-3">
            <img class="mb-4" src="./assets/img/inactive/playlist_tracker_icon_128.png" alt="" width="72" height="72">
            <h1 class="h3 mb-3 fw-normal">Enter a YouTube playlist URL</h1>
            <div class="form-floating p-2">
                <input type="text" class="form-control" id="playlist-url">
                <label for="playlist-url">Playlist URL</label>
            </div>
            <button class="w-100 btn btn-lg btn-primary" id="subscription-button" type="submit">Add to my subscriptions</button>
            <div class="container" id="system"></div>
        </div>
    `);
    $('#subscription-button').click(query);
    $('#subscription-button').prop('disabled', true);
    $('#playlist-url').on('input', validateYoutube);
}

function updatePlaylistName() {

}

function contentManager() {

}

function validateYoutube() {
    const regexYT = /^https:\/\/www\.youtube\.com\/playlist\?list=/;
    let url = $('#playlist-url').val();
        
    if(regexYT.test(url)) {
        $('#system').html('');
        $('#playlist-url').removeClass('is-invalid');
        $('#subscription-button').prop('disabled', false);
    } else {
        $('#system').html('this is not a valid playlist url for YouTube');
        $('#playlist-url').addClass('is-invalid');
        $('#subscription-button').prop('disabled', true);
    }
}

async function query(event) {
    event.preventDefault();
    $('#system').html('');
    account.actions += 1;
    try {
        const url = $('#playlist-url').val();
        for(let i = 0; i < account.playlists.length; i++) {
            if(account.playlists[i].playlist_url == url) { new Error('You are already subscribed to this playlist'); }
        }
        $('#subscription-button').prop('disabled', true);
        const response = await axios.post('http://chuadevs.com:12312/v1/api/youtube', { url: url });
        if(response.status === 200) {
            account.playlists.push(response.data);
            localStorage.setItem('abs_account',  JSON.stringify(account));
            const sync = await axios.put('http://chuadevs.com:12312/v1/account/sync', account);
            if(sync.status === 200)
                window.location.href = 'popup.html';
        }
    } catch(e) {
        $('#subscription-button').prop('disabled', false);
        $('#system').html(e.message);
    }
}

function nav() { 
    $('.navbar-nav').html(`
            <li class="nav-item ms-auto">
                <a class="nav-link" href="#" id="account-manager">Account Manager</a>
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
    $('#playlist-view').click(function() { window.location.href = 'popup.html' });
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
    playlistManager();
}

function init() {
    main();
}

$(document).ready(function() { init(); });