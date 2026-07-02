<!--Zander Spies u25033931-->
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Book Flights</title>
        <link rel="stylesheet" type="text/css" href="css/nav.css">
        <link rel="stylesheet" type="text/css" href="css/home.css">
        <link rel="icon" type="image/x-icon" href="img/logo.png">
    </head>
    <body>
        <header>
            <nav id="navbar">
                <?php include 'header.php';?>
            </nav>
        </header>

        <form id="bookFlightForm">

            <label>Select an aircraft:</label>
            <div class="autocomplete-wrapper">
                <input type="text" id="plane-search-input" placeholder="Search by model..." autocomplete="off">
                <ul id="plane-suggestions"></ul>
            </div>

            <br/>

            <label>Airport search:</label>
            <input type="text" id="airport-search" placeholder="Search by name, city, country or code...">

            <br/>

            <label>Departure airport:</label>
            <select id="departure-selection" size="5" required>
                <option disabled selected>Loading airports...</option>
            </select>
            <input type="date" id="departure-date">

            <br/>

            <label for="arrival-date">Arrival Date:</label>
            <select id="arrival-selection" size="5" required>
                <option disabled selected>Loading airports...</option>
            </select>
            <input type="date" id="arrival-date">

            <br/>

            <label>Return flight:</label>
            <input type="checkbox" id="return-flight">

            <br/>

            <label>Passengers:</label>
            <input type="number" id="passengers" min="1" value="1">

            <br/>

            <label>Cabin Class</label>
            <select id="cabin-class-selection" disabled>
                <option disabled selected>Select an aircraft first</option>
            </select>

            <br/>

            <input type="submit" value="Book Flight">
        </form>

        <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
        <script src="JS/ajax.js"></script>
        <script>
            window.onload = function() {
                initBookFlightPage();
            };
        </script>
    </body>
</html>