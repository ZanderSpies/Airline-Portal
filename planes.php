<!--Zander Spies u25033931-->
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Planes</title>
        <link rel="stylesheet" type="text/css" href="css/nav.css">
        <link rel="stylesheet" type="text/css" href="css/planes.css">
        <link rel="icon" type="image/x-icon" href="img/logo.png">
    </head>
    <body>
        <header>
            <nav id="navbar">
                <?php include 'header.php';?>
            </nav>
        </header>

        <div id="controls">
            <input type="text" placeholder="Search planes..." id="searchbar">

            <div class="dropdown">
                <button class="dropbtn">Filters</button>
                <div class="dropdown-content">
                    <label>Seats</label>
                    <br/>
                    0<input type="range" min="0" max="900" value="900">900

                    <label>Max Range (km)</label>
                    <br/>
                    0<input type="range" min="0" max="200000" value="20000">200000
                    <br/>
                    <label>Cabin Class</label>
                    <select>
                        <option disabled selected>All classes</option>
                        <option>First</option>
                        <option>Business</option>
                        <option>Economy</option>
                    </select>
                    <br/>
                    <label>Manufacturer</label>
                    <select>
                        <option disabled selected>All manufacturers</option>
                        <option>Boeing</option>
                        <option>Airbus</option>
                    </select>
                </div>
            </div>

            <div class="sort-bar">
                <span>Sort:</span>
                <button class="sort-btn" id="seatSort">Seats</button>
                <button class="sort-btn" id="manufacturerSort">Manufacturer</button>
                <button class="sort-btn" id="rangeSort">Range</button>
            </div>
        </div>

        <div id="planes-grid"></div>

        <div id="loading-container" style="display: none;">
            <img src="img/loader_v2.gif" alt="Loading...">
        </div>

        <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
        <script src="JS/ajax.js"></script>
        <script>
            window.onload = loadAllPlanes;
        </script>
    </body>
</html>