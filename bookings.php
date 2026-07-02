<!--Zander Spies u25033931-->
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bookings</title>
        <link rel="stylesheet" type="text/css" href="css/nav.css">
        <link rel="stylesheet" type="text/css" href="css/bookings.css">
        <link rel="icon" type="image/x-icon" href="img/logo.png">
    </head>
    <body>
        <header>
            <nav id="navbar">
                <?php include 'header.php';?>
            </nav>
        </header>

        <table>
            <thead>
                <tr>
                    <th class="column-names">Aircraft</th>
                    <th class="column-names">Route</th>
                    <th class="column-names">Distance</th>
                    <th class="column-names">Departure Date</th>
                    <th class="column-names">Estimated Flight Time</th>
                    <th class="column-names">Class / Passengers</th>
                    <th class="column-names">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td colspan="7" style="text-align:center; padding:20px;">Loading bookings...</td>
                </tr>
            </tbody>
        </table>

        <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
        <script src="JS/ajax.js"></script>
        <script>
            window.onload = loadBookings;
        </script>
    </body>
</html>