const account = JSON.parse(localStorage.getItem('abs_account'));
//chrome.storage.local.get('abs_account', function(result) { account = result.abs_account; });

function playlist() {
    if(account.playlists.length === 0) {
        $('#app').html(`
            <div class="container p-5 text-center">
                Your account does not have any playlists it is subscribed to. Navigate to the playlist manager to subscribe to one.
            </div>
        `);
    } else {
        for(let i = 0; i < account.playlists.length; i++) {            
            let { playlist_title, contents }  = account.playlists[i];
            $('#app').append(`<div class="bg-secondary text-bg-secondary p-1 border-top border-bottom title-bar" index="${i}">
                <span class="expansion-button" id="expansion-button-${i}" index="${i}"><img src="assets/img/active/playlist_tracker_icon_24.png"></span> 
                <span class="mx-1">${playlist_title}</span>
                <span class="playlist-menu mx-1" index="${i}"><img src="assets/img/option-icon.jpg" class="options-icon" ></span>
                <span class="popup-menu" id="popup-menu${i}">
                    <ul>
                        <li><button class="mark-all my-1 btn btn-secondary border button-container" type="button" id="${i}" marker="watch">Mark all as watched</button></li>
                        <li><button class="mark-all btn btn-secondary border button-container" type="button" id="${i}" marker="unwatch">Mark all unwatched</button></li>
                    </ul>
                </span>
            </div>
            <ul class="playlist" id="playlist-${i}"></ul>`);
            for(let j = 0; j < contents.length; j++) {
                if(!contents[j].viewed)
                    $(`#playlist-${i}`).append(`<li><a href="${contents[j].url}" class="playlist-entry" target="_blank" playlist="${i}" content="${j}">${contents[j].title}</a></li>`);
            }
        }
        $('.popup-menu').hide();
        $('.expansion-button').click(hide);
        $('.playlist-entry').click(viewed);
        $('.playlist-menu').click(playlistMenu);
        $('.mark-all').click(markAll);
    }
}

async function markAll() {
    let id = $(this).attr('id');
    let viewed = $(this).attr('marker') === 'watch' ? true : false;
    account.actions += 1;
    account.playlists[id].clicked += 1;
    for(let i = 0; i < account.playlists[id].contents.length; i++)
    {
        account.playlists[id].contents[i].viewed = viewed;
    }
    try {
        await chrome.storage.local.set({ "abs_account": account });
        await axios.put('http://chuadevs.com:12312/v1/account/sync', account);
        localStorage.setItem('abs_account', JSON.stringify(account));
        location.reload();
    } catch(e) {
        $('#system').html(e.message);
    }
}

function playlistMenu() {
    let id = $(this).attr('index');
    if($(`#popup-menu${id}`).is(':hidden')) {
        $('.popup-menu').hide();
        $(`#popup-menu${id}`).show();
    } else {
        $(`#popup-menu${id}`).hide();
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

async function viewed(e) {
    e.preventDefault();
    let url = $(this).attr('href');
    let playlist = $(this).attr('playlist');
    let content = $(this).attr('content');
    account.playlists[playlist].contents[content].viewed = true;
    account.playlists[playlist].clicked += 1;
    account.actions += 1;
    try {
        await chrome.storage.local.set({ "abs_account": account });
        await axios.put('http://chuadevs.com:12312/v1/account/sync', account);
        localStorage.setItem('abs_account', JSON.stringify(account));
        location.reload();
    } catch(e) {
        $('#system').html(e.message);
    }
    $(this).hide();
    window.open(url)
}

async function logoff() {
    try {
        await axios.put('http://chuadevs.com:12312/v1/account/sync', account);
        localStorage.removeItem('abs_account');
        await chrome.storage.local.remove('abs_account', () => { location.reload(); })
    } catch(e) {
        $('#system').html(e.message);
    }
}

async function init() {
    if(account) {
        $('.navbar-nav').html(`
            <li class="nav-item ms-auto">
                <a class="nav-link" href="#" id="account-manager">Account Manager</a>
            </li>
            <li class="nav-item ms-auto">
                <a class="nav-link" href="#" id="playlist-manager">Playlist Manager</a>
            </li>
            <li class="nav-item ms-auto">
                <a class="nav-link" href="#" id="log-off">Log off</a>
            </li>
        `);
        await chrome.storage.local.set({ "abs_account": account });
        $('#log-off').click(logoff);
        $('#playlist-manager').click(function() { window.location.href = 'playlists.html' });
        chrome.storage.local.get('abs_newData', function(result) {
            if(result.abs_newData !== undefined) {
                localStorage.setItem('abs_account', JSON.stringify(result.abs_newData));
                chrome.storage.local.remove('abs_newData', () => { 
                    try {
                        axios.put('http://chuadevs.com:12312/v1/account.sync', account);
                        location.reload();
                    } catch(e) {
                        console.error(e.message);
                    }
                });
            } else {
                console.log(`No new content`);
                playlist();
            } 
        });  
    } else {
        $('.navbar-nav').html(`
            <li class="nav-item ms-auto">
              <a class="nav-link active" aria-current="page" href="login.html">Login</a>
            </li>
        `);
        $('#app').html(`
            <h3 id="account-warning">An account is required to use this extension and all of its features</h3>
            <div class="p-3">
                <a href="login.html" class="btn btn-secondary">Login</a>
            </div>
        `);
        window.location.href = 'login.html'
    }
}

$(document).click(function(e) {
    if (!$(e.target).closest('.playlist-menu').length && !$(e.target).closest('.popup-menu').length) {
      $('.popup-menu').hide();
    }
});

$(document).ready(function() { init(); });