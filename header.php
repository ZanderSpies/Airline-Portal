<?php
// Zander Spies u25033931

include_once "config.php";

$current_page = basename($_SERVER['SCRIPT_NAME']);

$nav_links  = '<li class="linksBox">';
$nav_links .= '<a href="index.php"'    . ($current_page === 'index.php'    ? ' class="active-link"' : '') . '>Home</a>';
$nav_links .= '<a href="bookings.php"' . ($current_page === 'bookings.php' ? ' class="active-link"' : '') . '>Bookings</a>';
$nav_links .= '<a href="planes.php"'   . ($current_page === 'planes.php'   ? ' class="active-link"' : '') . '>Planes</a>';
$nav_links .= '<a href="favorites.php"'. ($current_page === 'favorites.php'? ' class="active-link"' : '') . '>Favorites</a>';

$nav_links .= '<span id="nav-auth-links"></span>';
$nav_links .= '</li>';

echo '<ul>
    <li class="logoBox">
        <img src="img/logo.png" alt="Global Gate Logo" class="logo">
        <span class="name">Global Gate</span>
    </li>
    ' . $nav_links . '
</ul>
<script>
(function() {
    var apikey   = localStorage.getItem("apikey");
    var userName = localStorage.getItem("user_name");
    var authEl   = document.getElementById("nav-auth-links");
    if (!authEl) return;
    if (apikey) {
        authEl.innerHTML =
            \'<span class="nav-username">Welcome, \' + (userName || "User") + \'</span>\' +
            \'<a href="logout.php" class="nav-logout-btn">Logout</a>\';
    } else {
        var loginActive  = (window.location.pathname.indexOf("login.php")  !== -1) ? \' class="active-link"\' : "";
        var signupActive = (window.location.pathname.indexOf("signup.php") !== -1) ? \' class="active-link"\' : "";
        authEl.innerHTML =
            \'<a href="login.php"\' + loginActive + \'>Login</a>\' +
            \'<a href="signup.php"\' + signupActive + \'>Sign Up</a>\';
    }
})();
</script>';
?>