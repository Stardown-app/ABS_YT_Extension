const account = localStorage.getItem("abs-account");

function init() {
    console.log(account);
    if(account !== null) {
        console.log('account is not null');
        $('.navbar-nav').html(`
            <li class="nav-item ms-auto">
                <a class="nav-link" href="#">Account Options</a>
            </li>
            <li class="nav-item ms-auto">
                <a class="nav-link" href="#">Playlist Options</a>
            </li>
        `)
    } else {
        console.log('account is null');
        $('.navbar-nav').html(`
            <li class="nav-item ms-auto">
              <a class="nav-link active" aria-current="page" href="login.html">Login</a>
            </li>
        `)
    }
}

$(document).ready(function() { init(); });