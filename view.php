<!--Zander Spies u25033931-->
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>View</title>
        <link rel="stylesheet" type="text/css" href="css/nav.css">
        <link rel="stylesheet" type="text/css" href="css/view.css">
        <link rel="icon" type="image/x-icon" href="img/logo.png">
    </head>
    <body>
        <header>
            <nav id="navbar">
                <?php include 'header.php';?>
            </nav>
        </header>

        <a href="planes.html" id="back-btn">Back to Planes</a>

        <div id="loading-container" style="display: none;">
            <img src="img/loader_v2.gif" alt="Loading...">
        </div>

        <div id="view-container"></div>

        <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
        <script src="JS/ajax.js"></script>
        <script>
            window.onload = function() {
                var urlParams = new URLSearchParams(window.location.search);
                var id = urlParams.get("id");
                loadSinglePlane(id);
            };
        </script>
    </body>
</html>