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
        <a class="navbar-brand me-auto" href="#" id="manual-sync" title="Check for new videos">
          <img src="/assets/img/inactive/playlist_tracker_icon_32.png" alt="ABS">
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

    $('#manual-sync').click(function(e) {
        e.preventDefault();
        try {
            chrome.runtime.sendMessage({action: "checkSubscriptions"});
        } catch(err) {
            console.log('woke service worker for subscription check');
        }
    });
}

async function logoff() {
    try {
        $('#system').html(`<img id="floating-animation" src="./assets/img/loading-200.gif">`);
        await axios.put(await apiUrl('/v1/account/sync'), account);
        localStorage.removeItem('abs_account');
        chrome.storage.local.remove('abs_account', () => window.location.href = 'login.html');
    } catch(e) {
        $('#system').html(e.response.data);
    }
}

async function showApiSettings(options = {}) {
    const onBack = options.onBack;
    const current = await getApiBaseUrl();

    $('#app').html(`
        <div class="container p-3 text-center animate__animated animate__lightSpeedInRight">
            <img class="mb-4" src="./assets/img/inactive/playlist_tracker_icon_128.png" alt="" width="72" height="72">
            <h1 class="h3 mb-3 fw-normal">API server</h1>
            <p class="text-muted small mb-3">
                Default: ${ABS_DEFAULT_API_BASE_URL}. Self-hosted deployments can point at your own ABS REST API.
            </p>
            <div class="form-floating">
                <input type="url" class="form-control" id="api-base-url" placeholder="https://abs-yt.chua.codes">
                <label for="api-base-url">API base URL</label>
            </div>
            <button class="mt-2 w-100 btn btn-lg btn-primary" id="save-api-url" type="button">Save</button>
            <button class="mt-2 w-100 btn btn-lg btn-outline-secondary" id="reset-api-url" type="button">Reset to default</button>
            ${onBack ? '<button class="mt-2 w-100 btn btn-link" id="back-api-url" type="button">Back</button>' : ''}
            <div class="container text-center mt-2" id="api-settings-status"></div>
        </div>
    `);

    $('#api-base-url').val(current);

    $('#save-api-url').click(async () => {
        try {
            $('#api-settings-status').html(`<img id="floating-animation" src="./assets/img/loading-200.gif">`);
            const saved = await setApiBaseUrl($('#api-base-url').val());
            $('#api-base-url').val(saved);
            $('#api-settings-status').html('API server updated.');
        } catch(e) {
            $('#api-settings-status').html(e.message || e);
        }
    });

    $('#reset-api-url').click(async () => {
        try {
            const restored = await resetApiBaseUrl();
            $('#api-base-url').val(restored);
            $('#api-settings-status').html('Restored the default API server.');
        } catch(e) {
            $('#api-settings-status').html(e.message || e);
        }
    });

    if (onBack) {
        $('#back-api-url').click(() => onBack());
    }
}