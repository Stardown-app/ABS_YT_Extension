const account = JSON.parse(localStorage.getItem('abs_account'));

function playlist() {
    if(account.playlists.length === 0) {
        $('#popup-body').html(`
            <p>Subscribe to a playlist</p>
        `);
    } else {
        for(let i = 0; i < account.playlists.length; i++) {            
            let { playlist_title, contents }  = account.playlists[i];
            $('#popup-body').append(`<div class="bg-secondary text-bg-secondary p-1 border-top border-bottom title-bar" index="${i}">
                <span class="expansion-button" id="expansion-button-${i}" index="${i}"><img src="assets/img/active/playlist_tracker_icon_24.png"></span> ${playlist_title}
            </div>
            <ul class="playlist" id="playlist-${i}"></ul>`);
            for(let j = 0; j < contents.length; j++) {
                if(!contents[j].viewed)
                    $(`#playlist-${i}`).append(`<li><a href="${contents[j].url}" class="playlist-entry" target="_blank" playlist="${i}" content="${j}">${contents[j].title}</a></li>`);
            }
        }

        $('.expansion-button').click(hide);

        $('.playlist-entry').click(viewed); 
    }
}

function hide() {
    let id = $(this).attr('index');
    if($(`#playlist-${id}`).is(':hidden')) {
        $(`#playlist-${id}`).show();
        $(`#expansion-button-${id}`).html('<img src="assets/img/active/playlist_tracker_icon_24.png">');
    } else {
        $(`#playlist-${id}`).hide();
        $(`#expansion-button-${id}`).html('<img src="assets/img/inactive/playlist_tracker_icon_24.png">');
    }
}

function viewed(e) {
    e.preventDefault();
    let url = $(this).attr('href');
    let playlist = $(this).attr('playlist');
    let content = $(this).attr('content');
    console.log(`playlist:${playlist}, content:${content}`);
    account.playlists[playlist].contents[content].viewed = true;
    localStorage.setItem('abs_account', JSON.stringify(account));
    $(this).hide();
    window.open(url)
}

function init() {
    console.log(account);
    if(account !== null) {
        $('.navbar-nav').html(`
            <li class="nav-item ms-auto">
                <a class="nav-link" href="#" id="account-options">Account Options</a>
            </li>
            <li class="nav-item ms-auto">
                <a class="nav-link" href="#" id="playlist-options">Playlist Options</a>
            </li>
            <li class="nav-item ms-auto">
                <a class="nav-link" href="#" id="log-off">Log off</a>
            </li>
        `);
        $('#log-off').click(function() { localStorage.removeItem('abs_account'); location.reload(); });
        playlist();
    } else {
        $('.navbar-nav').html(`
            <li class="nav-item ms-auto">
              <a class="nav-link active" aria-current="page" href="login.html">Login</a>
            </li>
        `);
        $('#popup-body').html(`
            <h3 id="account-warning">An account is required to use this extension and all of its features</h3>
            <div class="p-3">
                <a href="login.html" class="btn btn-secondary">Login</a>
            </div>
        `);
    }
}

$(document).ready(function() { init(); });