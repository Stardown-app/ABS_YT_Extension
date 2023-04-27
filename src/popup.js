const account = JSON.parse(localStorage.getItem('abs_account'));

function main() {
    if(account.playlists.length === 0) {
        $('#app').html(`
            <div class="container p-5 text-center">
                Your account does not have any playlists it is subscribed to. Navigate to the playlist options to subscribe to one.
            </div>
        `);
    } else {
        for(let i = 0; i < account.playlists.length; i++) {            
            let { playlist_title, contents }  = account.playlists[i];
            $('#app').append(`<div class="bg-secondary text-bg-secondary border-top border-bottom title-bar py-1" index="${i}">
                <span class="expansion-button" id="expansion-button-${i}" index="${i}"><img src="assets/img/active/playlist_tracker_icon_24.png"></span> 
                <span class="mx-1">${playlist_title}</span>
                <span class="playlist-menu mx-1" index="${i}"><img src="assets/img/option-icon.jpg" class="options-icon" ></span>
                <span class="popup-menu btn-group" id="popup-menu${i}">
                    <button class="mark-all btn btn-secondary border button-container" type="button" id="${i}" marker="watch">Mark all as watched</button>
                    <button class="mark-all btn btn-secondary border button-container" type="button" id="${i}" marker="unwatch">Mark all unwatched</button>
                </span>
            </div>
            <ul class="playlist" id="playlist-${i}"></ul>`);
            for(let j = 0; j < contents.length; j++) {
                if(!contents[j].viewed)
                    $(`#playlist-${i}`).append(`<li><a href="${contents[j].url}" class="playlist-entry" target="_blank" playlist="${i}" content="${j}">${contents[j].title}</a></li>`);
            }
        }
        $('#app').append(`<center><hr>
            <div class="container" id="system"></div>
            <p class="mt-2 mb-2 text-muted">© A Better Subscription 2023</p>
        </center>`);
        $('.mark-all').prop('disabled', false);
        $('.popup-menu').hide();
        $('.expansion-button').click(hide);
        $('.playlist-entry').click(viewed);
        $('.playlist-menu').click(playlistMenu);
        $('.mark-all').click(markAll);
    }
}

async function markAll() {
    $('#system').html(`<img src="./assets/img/loading.gif" id="floating-animation">`);
    let id = $(this).attr('id');
    let viewed = $(this).attr('marker') === 'watch' ? true : false;
    $('.mark-all').prop('disabled', true);
    account.actions += 1;
    account.playlists[id].clicked += 1;
    for(let i = 0; i < account.playlists[id].contents.length; i++) {
        account.playlists[id].contents[i].viewed = viewed;
    }
    try {
        await axios.put('http://chuadevs.com:12312/v1/account/sync', account);
        chrome.storage.local.set({ "abs_account": account }, () => {
            localStorage.setItem('abs_account', JSON.stringify(account));
            location.reload();
        });  
    } catch(e) {
        $('#system').html(e.response.data);
        $('.mark-all').prop('disabled', false);
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

function viewed(e) {
    e.preventDefault();
    let url = $(this).attr('href');
    let playlist = $(this).attr('playlist');
    let content = $(this).attr('content');
    account.playlists[playlist].contents[content].viewed = true;
    account.playlists[playlist].clicked += 1;
    account.actions += 1;
    try {
        chrome.storage.local.set({ "abs_account": account }, () => {
            axios.put('http://chuadevs.com:12312/v1/account/sync', account);
            localStorage.setItem('abs_account', JSON.stringify(account));
            location.reload();
        }); 
    } catch(e) {
        $('#system').html(e.response.data);
    }
    $(this).hide();
    window.open(url)
}

function logoff() {
    try {
        $('#system').html(`<img id="floating-animation" src="./assets/img/loading.gif">`);
        axios.put('http://chuadevs.com:12312/v1/account/sync', account);
        localStorage.removeItem('abs_account');
        chrome.storage.local.remove('abs_account', () => { location.reload(); })
    } catch(e) {
        $('#system').html(e.response.data);
    }
}

function init() {
    $('#system').html(`<img id="floating-animation" src="./assets/img/loading.gif">`);
    if(account) {
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
        $('#log-off').click(logoff);
        $('#playlist-options').click(() => window.location.href = 'playlists.html');
        $('#account-options').click(() => window.location.href = 'account.html');
        chrome.storage.local.get(['abs_newData', 'abs_account'], async result => {
            if(result.abs_newData) {
                try {
                    await axios.put('http://chuadevs.com:12312/v1/account/sync', result.abs_account);
                    chrome.storage.local.remove('abs_newData', () => {
                        localStorage.setItem('abs_account', JSON.stringify(result.abs_account));
                        location.reload(); 
                    });
                } catch(e) {
                    console.error(e.response.data);
                    setTimeout(() => location.reload(), 10000);
                }
            } else {
                chrome.storage.local.get('abs_fetchLog', result => {
                    let log = result.abs_fetchLog;
                    if(log !== undefined) {
                        for(let i = 0; i < log.length; i++) {
                            console.log(log[i]);
                        }
                        chrome.storage.local.remove('abs_fetchLog', () => main());
                    } else {
                        console.log('fetchLog is undefined');
                        main();
                    }
                });
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

function refresh() {
    try {
        chrome.runtime.sendMessage({action: "checkSubscriptions"}, response => {});
    } catch(err) {
        console.log('successfully work up service worker');
    }
}

$(document).click(function(e) {
    if(account.email === "jon.chua51@gmail.com") $('#secret-plum-sauce').click(refresh);
    if (!$(e.target).closest('.playlist-menu').length && !$(e.target).closest('.popup-menu').length) $('.popup-menu').hide();
});

$(document).ready(function() { init(); });