function footer() {
    const year = new Date().getFullYear();
    $('body').append(`<center><hr>
    <div class="container" id="system"></div>
    <p class="mt-2 mb-2 text-muted">© A Better Subscription ${year}</p>
    </center>`);
}

function app() {
    $('body').append(`
    <nav class="navbar navbar-light" style="background-color: #eef1ef;">
      <div class="container-fluid">
        <a class="navbar-brand me-auto" id="secret-plum-sauce">
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
    <div id="app" class="animate__animated animate__slideInRight"></div>
    `);
}

async function logoff() {
    try {
        $('#system').html(`<img id="floating-animation" src="./assets/img/loading-200.gif">`);
        await axios.put('http://chuadevs.com:12312/v1/account/sync', account);
        localStorage.removeItem('abs_account');
        chrome.storage.local.remove('abs_account', () => window.location.href = 'login.html');
    } catch(e) {
        $('#system').html(e.response.data);
    }
}