<?php
// Zander Spies u25033931

session_start();
$_SESSION = array();
session_destroy();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Logging out...</title>
</head>
<body>
<script>
    // Clear API key and user info from localStorage
    localStorage.removeItem("apikey");
    localStorage.removeItem("user_name");
    localStorage.removeItem("favPlanes");
    window.location.href = "login.php";
</script>
</body>
</html>