// Zander Spies u25033931
// I chose to use asynchronous calls because it allows the page to remain responsive while
// the data is being fetched from the API, allowing the loading animation to actually move.
// localStorage is used to persist the API key across sessions (chosen over cookies because
// it is simpler to read/write in JS, not sent with every HTTP request, and sufficient since
// the API key is not authentication-sensitive enough to require httpOnly cookie protection).

var localPlanes = [];
var airportPage = 1;
var allAirportsLoaded = false;
var selectedPlaneId = null;
var selectedPlaneData = null;

var API_URL = "/u25033931/api.php";


function getApiKey() {
    return localStorage.getItem("apikey") || "";
}

function setApiKey(key) {
    localStorage.setItem("apikey", key);
}

function clearApiKey() {
    localStorage.removeItem("apikey");
    localStorage.removeItem("user_name");
}

function isLoggedIn() {
    return getApiKey() !== "";
}

function apiPost(params, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", API_URL, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            var response;
            try {
                response = JSON.parse(xhr.responseText);
            } catch (e) {
                response = { status: "error", data: "Unexpected server error." };
            }
            callback(response, xhr.status);
        }
    };
    xhr.send(JSON.stringify(params));
}


function loadAllPlanes() {
    $("#loading-container").show();
    apiPost({
        "type":    "GetAllPlanes",
        "apikey":  getApiKey(),
        "return":  "*",
        "limit":   50
    }, function(response) {
        $("#loading-container").hide();
        if (response.status === "success") {
            localPlanes = response.data;
            renderPlanes(localPlanes);
        }
    });
}

function loadSinglePlane(id) {
    $("#loading-container").show();
    apiPost({
        "type":   "GetAllPlanes",
        "apikey": getApiKey(),
        "return": "*",
        "search": { "id": id }
    }, function(response) {
        $("#loading-container").hide();
        if (response.status === "success" && response.data.length > 0) {
            var plane = response.data[0];
            var container = document.getElementById("view-container");
            container.innerHTML =
                '<div id="plane-img"><img src="' + plane.image_url + '"></div>' +
                '<div id="view-body">' +
                    '<p>' + plane.manufacturer + '</p>' +
                    '<h1>' + plane.model + '</h1>' +
                    '<p id="view-description">' + plane.description + '</p>' +
                    '<div id="stats-grid">' +
                        '<div><div class="stat-label">Seats</div><div class="stat-value">' + plane.seats + '</div></div>' +
                        '<div><div class="stat-label">Max Range</div><div class="stat-value">' + plane.max_range_km + ' km</div></div>' +
                        '<div><div class="stat-label">Max Speed</div><div class="stat-value">' + plane.max_speed_kmh + ' kmh</div></div>' +
                        '<div><div class="stat-label">Cargo Capacity</div><div class="stat-value">' + plane.max_cargo_kg + ' kg</div></div>' +
                        '<div><div class="stat-label">Manufacturer</div><div class="stat-value" style="font-size:16px;">' + plane.manufacturer + '</div></div>' +
                        '<div><div class="stat-label">Model</div><div class="stat-value" style="font-size:16px;">' + plane.model + '</div></div>' +
                    '</div>' +
                    '<div id="cabin-section">' +
                        '<h3>Available Cabin Classes</h3>' +
                        '<div id="cabinList"></div>' +
                    '</div>' +
                '</div>';

            var classArray = plane.classes.split(",");
            var list = document.getElementById("cabinList");
            classArray.forEach(function(item) {
                list.innerHTML += "<li>" + item.trim() + "</li>";
            });
        }
    });
}

function loadSortedPlanes(column, order) {
    $("#loading-container").show();
    apiPost({
        "type":   "GetAllPlanes",
        "apikey": getApiKey(),
        "return": "*",
        "limit":  50,
        "sort":   column,
        "order":  order
    }, function(response) {
        $("#loading-container").hide();
        if (response.status === "success") {
            localPlanes = response.data;
            renderPlanes(localPlanes);
        }
    });
}

function searchPlanes(query) {
    $("#loading-container").show();
    apiPost({
        "type":   "GetAllPlanes",
        "apikey": getApiKey(),
        "fuzzy":  query,
        "return": "*"
    }, function(response) {
        $("#loading-container").hide();
        var grid = document.getElementById("planes-grid");
        grid.innerHTML = "";
        if (!response.data || response.data.length === 0) {
            grid.innerHTML = "<p class='no-results'>No planes found matching '" + query + "'</p>";
            return;
        }
        localPlanes = response.data;
        renderPlanes(localPlanes);
    });
}

function applyFilters() {
    var selectedManufacturer = $(".dropdown-content select").last().val();
    var selectedClass        = $(".dropdown-content select").first().val();
    var maxSeats             = parseInt($(".dropdown-content input[type='range']").first().val());
    var maxRange             = parseInt($(".dropdown-content input[type='range']").last().val());

    var params = {
        "type":   "GetAllPlanes",
        "apikey": getApiKey(),
        "return": "*",
        "limit":  50
    };
    if (selectedManufacturer && selectedManufacturer !== "All manufacturers") {
        params.search = { "manufacturer": selectedManufacturer };
    }

    $("#loading-container").show();
    apiPost(params, function(response) {
        $("#loading-container").hide();
        if (!response.data || response.data.length === 0) {
            $("#planes-grid").html("<p class='no-results'>No planes match these specific filters.</p>");
            return;
        }
        var filtered = response.data.filter(function(plane) {
            var matchClass = (!selectedClass || selectedClass === "All classes" ||
                              plane.classes.toLowerCase().includes(selectedClass.toLowerCase()));
            return matchClass && plane.seats <= maxSeats && plane.max_range_km <= maxRange;
        });
        if (filtered.length === 0) {
            $("#planes-grid").html("<p class='no-results'>No planes match these specific filters.</p>");
        } else {
            localPlanes = filtered;
            renderPlanes(filtered);
        }
    });
}


function toggleFavorite(planeId) {
    if (!isLoggedIn()) {
        // Guest: use localStorage only
        var favorites = JSON.parse(localStorage.getItem("favPlanes")) || [];
        var id = String(planeId);
        var index = favorites.indexOf(id);
        if (index === -1) {
            favorites.push(id);
        } else {
            favorites.splice(index, 1);
        }
        localStorage.setItem("favPlanes", JSON.stringify(favorites));
        if (document.title === "Favorites") {
            loadFavorites();
        } else {
            renderPlanes(localPlanes);
        }
        return;
    }

    var favorites = JSON.parse(localStorage.getItem("favPlanes")) || [];
    var id = String(planeId);
    var isFav = favorites.indexOf(id) !== -1;
    var type = isFav ? "RemoveFavorite" : "AddFavorite";

    apiPost({
        "type":     type,
        "apikey":   getApiKey(),
        "plane_id": planeId
    }, function(response) {
        if (response.status === "success") {
            if (isFav) {
                favorites.splice(favorites.indexOf(id), 1);
            } else {
                favorites.push(id);
            }
            localStorage.setItem("favPlanes", JSON.stringify(favorites));
            if (document.title === "Favorites") {
                loadFavorites();
            } else {
                renderPlanes(localPlanes);
            }
        } else {
            if (response.data && response.data.indexOf("already") !== -1) {
                if (favorites.indexOf(id) === -1) favorites.push(id);
                localStorage.setItem("favPlanes", JSON.stringify(favorites));
                renderPlanes(localPlanes);
            }
        }
    });
}

function loadFavorites() {
    var grid = document.getElementById("planes-grid");

    if (isLoggedIn()) {
        // Fetch from API
        $("#loading-container").show();
        apiPost({
            "type":   "GetFavorites",
            "apikey": getApiKey()
        }, function(response) {
            $("#loading-container").hide();
            if (response.status === "success") {
                // Sync localStorage with DB
                var ids = response.data.map(function(p) { return String(p.id); });
                localStorage.setItem("favPlanes", JSON.stringify(ids));
                if (response.data.length === 0) {
                    grid.innerHTML =
                        '<div style="text-align:center; grid-column: 1/-1; padding: 50px; color: #202656;">' +
                            '<h2>No Favorites Yet</h2>' +
                            '<p>Go to the <a href="planes.php">Planes page</a> to add some!</p>' +
                        '</div>';
                } else {
                    renderPlanes(response.data);
                }
            }
        });
        return;
    }

    var favorites = JSON.parse(localStorage.getItem("favPlanes")) || [];
    if (favorites.length === 0) {
        grid.innerHTML =
            '<div style="text-align:center; grid-column: 1/-1; padding: 50px; color: #202656;">' +
                '<h2>No Favorites Yet</h2>' +
                '<p>Go to the <a href="planes.php">Planes page</a> to add some! (Log in to save favorites permanently.)</p>' +
            '</div>';
        return;
    }

    $("#loading-container").show();
    grid.innerHTML = "";
    var loadedPlanes = [];
    var remaining = favorites.length;

    favorites.forEach(function(id) {
        apiPost({
            "type":   "GetAllPlanes",
            "apikey": getApiKey(),
            "search": { "id": id },
            "return": "*"
        }, function(response) {
            remaining--;
            if (response.status === "success" && response.data && response.data.length > 0) {
                loadedPlanes.push(response.data[0]);
            }
            if (remaining === 0) {
                $("#loading-container").hide();
                if (loadedPlanes.length === 0) {
                    grid.innerHTML = "<p style='text-align:center; grid-column:1/-1;'>Could not load favorite planes.</p>";
                } else {
                    renderPlanes(loadedPlanes);
                }
            }
        });
    });
}

function initBookFlightPage() {
    airportPage = 1;
    allAirportsLoaded = false;
    loadAirportPage("departure-selection");
    loadAirportPage("arrival-selection");

    $("#return-flight").on("change", function() {
        var label = $("label[for='arrival-date']");
        if ($(this).is(":checked")) {
            label.text("Return Date:");
        } else {
            label.text("Arrival Date:");
        }
    });

    $("#plane-search-input").on("input", function() {
        var query = $(this).val();
        if (query.length >= 2) {
            searchPlanesForBooking(query);
        } else {
            $("#plane-suggestions").empty().hide();
        }
    });

    $("#departure-selection").on("scroll", function() {
        var el = this;
        if (el.scrollTop + el.offsetHeight >= el.scrollHeight - 10 && !allAirportsLoaded) {
            airportPage++;
            loadAirportPage("departure-selection");
            loadAirportPage("arrival-selection");
        }
    });

    $("#airport-search").on("input", function() {
        var query = $(this).val().trim();
        if (query.length >= 2) {
            searchAirports(query, "departure-selection");
            searchAirports(query, "arrival-selection");
        } else if (query.length === 0) {
            $("#departure-selection").empty();
            $("#arrival-selection").empty();
            airportPage = 1;
            allAirportsLoaded = false;
            loadAirportPage("departure-selection");
            loadAirportPage("arrival-selection");
        }
    });

    $("form").on("submit", function(e) {
        e.preventDefault();
        submitBooking();
    });
}

function loadAirportPage(selectId) {
    apiPost({
        "type":   "GetAllAirports",
        "apikey": getApiKey(),
        "page":   airportPage
    }, function(response) {
        if (response.status === "success") {
            var select = document.getElementById(selectId);
            // Remove placeholder on first load
            if (airportPage === 1) select.innerHTML = "";
            if (!response.data || response.data.length === 0) {
                allAirportsLoaded = true;
                return;
            }
            response.data.forEach(function(airport) {
                var opt = document.createElement("option");
                opt.value = airport.code;
                opt.setAttribute("data-lat", airport.latitude);
                opt.setAttribute("data-lng", airport.longitude);
                opt.textContent = airport.name + " (" + airport.code + ") - " + airport.city + ", " + airport.country;
                select.appendChild(opt);
            });
        }
    });
}

function searchAirports(query, selectId) {
    apiPost({
        "type":   "GetAllAirports",
        "apikey": getApiKey(),
        "search": query
    }, function(response) {
        var select = document.getElementById(selectId);
        select.innerHTML = "";
        if (!response.data || response.data.length === 0) {
            var opt = document.createElement("option");
            opt.textContent = "No airports found";
            opt.disabled = true;
            select.appendChild(opt);
            return;
        }
        response.data.forEach(function(airport) {
            var opt = document.createElement("option");
            opt.value = airport.code;
            opt.setAttribute("data-lat", airport.latitude);
            opt.setAttribute("data-lng", airport.longitude);
            opt.textContent = airport.name + " (" + airport.code + ") - " + airport.city + ", " + airport.country;
            select.appendChild(opt);
        });
    });
}

function searchPlanesForBooking(query) {
    apiPost({
        "type":   "GetAllPlanes",
        "apikey": getApiKey(),
        "fuzzy":  query,
        "return": "*",
        "limit":  8
    }, function(response) {
        var suggestions = document.getElementById("plane-suggestions");
        suggestions.innerHTML = "";
        if (!response.data || response.data.length === 0) {
            suggestions.style.display = "none";
            return;
        }
        suggestions.style.display = "block";
        response.data.forEach(function(plane) {
            var li = document.createElement("li");
            li.textContent = plane.manufacturer + " " + plane.model;
            li.setAttribute("data-id", plane.id);
            li.onclick = function() {
                document.getElementById("plane-search-input").value = li.textContent;
                selectedPlaneId   = plane.id;
                selectedPlaneData = plane;
                suggestions.style.display = "none";
                updateCabinClasses(plane.classes);
            };
            suggestions.appendChild(li);
        });
    });
}

function updateCabinClasses(classesString) {
    var cabinSelect = document.getElementById("cabin-class-selection");
    cabinSelect.innerHTML = "<option disabled selected>Select cabin class</option>";
    var classes = classesString.split(",");
    classes.forEach(function(c) {
        var opt = document.createElement("option");
        opt.value = c.trim();
        opt.textContent = c.trim();
        cabinSelect.appendChild(opt);
    });
    cabinSelect.disabled = false;
}

function submitBooking() {
    if (!isLoggedIn()) {
        showBookingMessage("error", "You must be logged in to book a flight. <a href='login.php'>Login here</a>.");
        return;
    }

    var depSelect    = document.getElementById("departure-selection");
    var arrSelect    = document.getElementById("arrival-selection");
    var depDate      = document.getElementById("departure-date").value;
    var arrDate      = document.getElementById("arrival-date").value;
    var isReturn     = document.getElementById("return-flight").checked;
    var passengers   = parseInt(document.getElementById("passengers").value);
    var cabinClass   = document.getElementById("cabin-class-selection").value;

    if (!selectedPlaneId) {
        showBookingMessage("error", "Please select an aircraft.");
        return;
    }
    if (!depSelect.value) {
        showBookingMessage("error", "Please select a departure airport.");
        return;
    }
    if (!arrSelect.value) {
        showBookingMessage("error", "Please select an arrival airport.");
        return;
    }
    if (!depDate) {
        showBookingMessage("error", "Please select a departure date.");
        return;
    }
    if (isReturn && !arrDate) {
        showBookingMessage("error", "Please select a return date.");
        return;
    }
    if (!cabinClass || cabinClass === "Select cabin class") {
        showBookingMessage("error", "Please select a cabin class.");
        return;
    }

    var params = {
        "type":            "BookFlight",
        "apikey":          getApiKey(),
        "plane_id":        selectedPlaneId,
        "departure_code":  depSelect.value,
        "arrival_code":    arrSelect.value,
        "departure_date":  depDate,
        "passengers":      passengers,
        "cabin_class":     cabinClass,
        "is_return":       isReturn
    };
    if (isReturn) params.return_date = arrDate;

    showBookingMessage("info", "Processing your booking...");

    apiPost(params, function(response) {
        if (response.status === "success") {
            var hrs  = Math.floor(response.data.flight_mins / 60);
            var mins = response.data.flight_mins % 60;
            showBookingMessage("success",
                "Booking confirmed! Distance: " + response.data.distance_km + " km, " +
                "Flight time: " + hrs + "h " + mins + "m."
            );
        } else {
            showBookingMessage("error", response.data || "Booking failed.");
        }
    });
}

function showBookingMessage(type, msg) {
    var old = document.getElementById("booking-msg");
    if (old) old.parentNode.removeChild(old);
    var div = document.createElement("div");
    div.id = "booking-msg";
    div.style.margin      = "16px 0";
    div.style.padding     = "10px 14px";
    div.style.borderRadius = "6px";
    div.style.fontWeight  = "500";
    if (type === "success") {
        div.style.background = "#d4edda"; div.style.color = "#155724"; div.style.border = "1px solid #c3e6cb";
    } else if (type === "error") {
        div.style.background = "#f8d7da"; div.style.color = "#721c24"; div.style.border = "1px solid #f5c6cb";
    } else {
        div.style.background = "#d1ecf1"; div.style.color = "#0c5460"; div.style.border = "1px solid #bee5eb";
    }
    div.innerHTML = msg;
    var form = document.querySelector("form");
    form.parentNode.insertBefore(div, form.nextSibling);
}

function loadBookings() {
    if (!isLoggedIn()) {
        document.querySelector("tbody").innerHTML =
            '<tr><td colspan="6" style="text-align:center; padding:20px;">' +
            'You must be <a href="login.php">logged in</a> to see your bookings.</td></tr>';
        return;
    }

    apiPost({
        "type":   "GetBookings",
        "apikey": getApiKey()
    }, function(response) {
        var tbody = document.querySelector("tbody");
        tbody.innerHTML = "";
        if (!response.data || response.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">No bookings yet.</td></tr>';
            return;
        }
        response.data.forEach(function(b) {
            var hrs  = Math.floor(b.flight_time / 60);
            var mins = b.flight_time % 60;
            var row  = document.createElement("tr");
            row.innerHTML =
                '<td>' + b.manufacturer + ' ' + b.model + '</td>' +
                '<td>' + b.departure_airport_code + ' → ' + b.arrival_airport_code + '</td>' +
                '<td>' + b.distance + ' km</td>' +
                '<td>' + b.departure_date + '</td>' +
                '<td>' + hrs + 'h ' + mins + 'm</td>' +
                '<td>' + b.cabin_class + ' (' + b.passengers + ' pax)</td>' +
                '<td><button class="delete-button" onclick="deleteBooking(' + b.booking_id + ', this)">Delete</button></td>';
            tbody.appendChild(row);
        });
    });
}

function deleteBooking(bookingId, btn) {
    if (!confirm("Delete this booking?")) return;
    btn.disabled = true;
    apiPost({
        "type":       "DeleteBooking",
        "apikey":     getApiKey(),
        "booking_id": bookingId
    }, function(response) {
        if (response.status === "success") {
            loadBookings();
        } else {
            btn.disabled = false;
            alert(response.data || "Failed to delete booking.");
        }
    });
}

function renderPlanes(planesList) {
    var grid = document.getElementById("planes-grid");
    if (!grid) return;
    grid.innerHTML = "";
    var favorites = JSON.parse(localStorage.getItem("favPlanes")) || [];
    var onFavoritesPage = (document.title === "Favorites");
    planesList.forEach(function(plane) {
        var isFav = favorites.includes(String(plane.id));
        var starClass = (isFav || onFavoritesPage) ? "active-fav" : "";
        grid.innerHTML +=
            '<div class="plane-card">' +
                '<div class="plane-img"><img src="' + plane.image_url + '"></div>' +
                '<div class="plane-card-body">' +
                    '<span class="plane-manufacturer">' + plane.manufacturer + '</span>' +
                    '<p class="plane-model">' + plane.model + '</p>' +
                    '<div class="plane-meta">' +
                        '<span class="meta-chip">' + plane.seats + ' seats</span>' +
                        '<span class="meta-chip">' + plane.max_range_km + ' km</span>' +
                    '</div>' +
                '</div>' +
                '<div class="plane-card-footer">' +
                    '<a href="view.php?id=' + plane.id + '" class="btn-view">View Details</a>' +
                    '<button class="btn-fav ' + starClass + '" onclick="toggleFavorite(\'' + plane.id + '\')">&#9733;</button>' +
                '</div>' +
            '</div>';
    });
}

$(document).ready(function() {
    $(".sort-btn:contains('Seats')").on("click", function() {
        loadSortedPlanes("seats", "DESC");
    });
    $(".sort-btn:contains('Manufacturer')").on("click", function() {
        loadSortedPlanes("manufacturer", "ASC");
    });
    $(".sort-btn:contains('Range')").on("click", function() {
        loadSortedPlanes("max_range_km", "DESC");
    });

    $(".dropdown-content select").on("change", applyFilters);
    $(".dropdown-content input[type='range']").on("input", applyFilters);

    $("#searchbar").on("input", function() {
        var query = $(this).val();
        if (query.length >= 3) {
            searchPlanes(query);
        } else if (query.length === 0) {
            loadAllPlanes();
        }
    });
});