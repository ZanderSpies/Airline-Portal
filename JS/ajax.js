// Zander Spies u25033931
// I chose to use asynchronous calls because it allows the page to remain responsive while the data is being fetched from the API allowing the loading animation to actually move
//localStorage is used for favorites because the users favorites will still be there when they close and open the webpage again

var localPlanes = [];
var req = new XMLHttpRequest();

var airportPage = 1;
var allAirportsLoaded = false;
var selectedPlaneId = null;

function loadAllPlanes() {
    $("#loading-container").show();
    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            $("#loading-container").hide();
            if (req.status == 200) {
                var response = JSON.parse(req.responseText);
                localPlanes = response.data;
                renderPlanes(localPlanes);
            }
        }
    };
    req.open("POST", "https://wheatley.cs.up.ac.za/api/", true);
    req.setRequestHeader("Content-Type", "application/json");
    var params = {
        "studentnum": "u25033931",
        "apikey": "037c869ef00b1364930193a916c02d06",
        "type": "GetAllPlanes",
        "return": "*",
        "limit": 20
    };
    req.send(JSON.stringify(params));
}

function loadSinglePlane(id) {
    $("#loading-container").show();
    var singleReq = new XMLHttpRequest();
    singleReq.onreadystatechange = function() {
        if (singleReq.readyState == 4) {
            $("#loading-container").hide();
            if (singleReq.status == 200) {
                var response = JSON.parse(singleReq.responseText);
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
        }
    };
    singleReq.open("POST", "https://wheatley.cs.up.ac.za/api/", true);
    singleReq.setRequestHeader("Content-Type", "application/json");
    var params = {
        "studentnum": "u25033931",
        "apikey": "037c869ef00b1364930193a916c02d06",
        "type": "GetAllPlanes",
        "return": "*",
        "search": { "id": id }
    };
    singleReq.send(JSON.stringify(params));
}

$(document).ready(function() {
    $("#searchbar").on("input", function() {
        var query = $(this).val();
        if (query.length >= 3) {
            searchPlanes(query);
        } else if (query.length === 0) {
            loadAllPlanes();
        }
    });

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

    $(".dropdown-content input[type='range']").on("input", function() {
        applyFilters();
    });

    if (document.getElementById("plane-search-input")) {
        initBookFlightPage();
    }
});

function loadSortedPlanes(column, order) {
    $("#loading-container").show();
    var sortReq = new XMLHttpRequest();
    sortReq.onreadystatechange = function() {
        if (sortReq.readyState == 4) {
            $("#loading-container").hide();
            if (sortReq.status == 200) {
                var response = JSON.parse(sortReq.responseText);
                localPlanes = response.data;
                renderPlanes(localPlanes);
            }
        }
    };
    sortReq.open("POST", "https://wheatley.cs.up.ac.za/api/", true);
    sortReq.setRequestHeader("Content-Type", "application/json");
    var params = {
        "studentnum": "u25033931",
        "apikey": "037c869ef00b1364930193a916c02d06",
        "type": "GetAllPlanes",
        "return": "*",
        "limit": 20,
        "sort": column,
        "order": order
    };
    sortReq.send(JSON.stringify(params));
}

function searchPlanes(query) {
    $("#loading-container").show();
    var searchReq = new XMLHttpRequest();
    searchReq.onreadystatechange = function() {
        if (searchReq.readyState == 4) {
            $("#loading-container").hide();
            if (searchReq.status == 200) {
                var response = JSON.parse(searchReq.responseText);
                var grid = document.getElementById("planes-grid");
                grid.innerHTML = "";
                if (!response.data || response.data.length === 0) {
                    grid.innerHTML = "<p class='no-results'>No planes found matching '" + query + "'</p>";
                    return;
                }
                localPlanes = response.data;
                renderPlanes(localPlanes);
            }
        }
    };
    searchReq.open("POST", "https://wheatley.cs.up.ac.za/api/", true);
    searchReq.setRequestHeader("Content-Type", "application/json");
    var params = {
        "studentnum": "u25033931",
        "apikey": "037c869ef00b1364930193a916c02d06",
        "type": "GetAllPlanes",
        "search": { "manufacturer": query },
        "return": "*"
    };
    searchReq.send(JSON.stringify(params));
}

function applyFilters() {
    var selectedManufacturer = $(".dropdown-content select").last().val();
    var selectedClass = $(".dropdown-content select").first().val();
    var maxSeats = parseInt($(".dropdown-content input[type='range']").first().val());
    var maxRange = parseInt($(".dropdown-content input[type='range']").last().val());

    $("#loading-container").show();
    var filterReq = new XMLHttpRequest();
    filterReq.onreadystatechange = function() {
        if (filterReq.readyState == 4) {
            $("#loading-container").hide();
            if (filterReq.status == 200) {
                var response = JSON.parse(filterReq.responseText);
                if (!response.data || response.data.length === 0) {
                    $("#planes-grid").html("<p class='no-results'>No planes match these specific filters.</p>");
                    return;
                }
                var filtered = response.data.filter(function(plane) {
                    var matchClass = (selectedClass === "All classes" ||
                                      selectedClass === null ||
                                      plane.classes.toLowerCase().includes(selectedClass.toLowerCase()));
                    var matchSeats = (plane.seats <= maxSeats);
                    var matchRange = (plane.max_range_km <= maxRange);
                    return matchClass && matchSeats && matchRange;
                });
                if (filtered.length === 0) {
                    $("#planes-grid").html("<p class='no-results'>No planes match these specific filters.</p>");
                } else {
                    localPlanes = filtered;
                    renderPlanes(filtered);
                }
            }
        }
    };
    filterReq.open("POST", "https://wheatley.cs.up.ac.za/api/", true);
    filterReq.setRequestHeader("Content-Type", "application/json");
    var params = {
        "studentnum": "u25033931",
        "apikey": "037c869ef00b1364930193a916c02d06",
        "type": "GetAllPlanes",
        "return": "*",
        "limit": 20
    };
    if (selectedManufacturer && selectedManufacturer !== "All manufacturers") {
        params.search = { "manufacturer": selectedManufacturer };
    }
    filterReq.send(JSON.stringify(params));
}

function toggleFavorite(planeId) {
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
}

function loadFavorites() {
    var favorites = JSON.parse(localStorage.getItem("favPlanes")) || [];
    var grid = document.getElementById("planes-grid");

    if (favorites.length === 0) {
        grid.innerHTML =
            '<div style="text-align:center; grid-column: 1/-1; padding: 50px; color: #202656;">' +
                '<h2>No Favorites Yet</h2>' +
                '<p>Go to the <a href="planes.html" style="color: white;">Planes page</a> to add some!</p>' +
            '</div>';
        return;
    }

    $("#loading-container").show();
    grid.innerHTML = "";

    var loadedPlanes = [];
    var remaining = favorites.length;

    favorites.forEach(function(id) {
        var favReq = new XMLHttpRequest();
        favReq.onreadystatechange = function() {
            if (favReq.readyState == 4) {
                remaining--;
                if (favReq.status == 200) {
                    var response = JSON.parse(favReq.responseText);
                    if (response.data && response.data.length > 0) {
                        loadedPlanes.push(response.data[0]);
                    }
                }
                if (remaining === 0) {
                    $("#loading-container").hide();
                    if (loadedPlanes.length === 0) {
                        grid.innerHTML = "<p style='text-align:center; grid-column:1/-1;'>Could not load favorite planes.</p>";
                    } else {
                        renderPlanes(loadedPlanes);
                    }
                }
            }
        };
        favReq.open("POST", "https://wheatley.cs.up.ac.za/api/", true);
        favReq.setRequestHeader("Content-Type", "application/json");
        var params = {
            "studentnum": "u25033931",
            "apikey": "037c869ef00b1364930193a916c02d06",
            "type": "GetAllPlanes",
            "search": { "id": id },
            "return": "*"
        };
        favReq.send(JSON.stringify(params));
    });
}

function initBookFlightPage() {
    airportPage = 1;
    allAirportsLoaded = false;
    loadAirportPage("departure-selection");
    loadAirportPage("arrival-selection");

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
}

function loadAirportPage(selectId) {
    var airReq = new XMLHttpRequest();
    airReq.onreadystatechange = function() {
        if (airReq.readyState == 4 && airReq.status == 200) {
            var response = JSON.parse(airReq.responseText);
            var select = document.getElementById(selectId);
            if (!response.data || response.data.length === 0) {
                allAirportsLoaded = true;
                return;
            }
            response.data.forEach(function(airport) {
                var opt = document.createElement("option");
                opt.value = airport.id;
                opt.textContent = airport.name + " (" + airport.code + ") - " + airport.city + ", " + airport.country;
                select.appendChild(opt);
            });
        }
    };
    airReq.open("POST", "https://wheatley.cs.up.ac.za/api/", true);
    airReq.setRequestHeader("Content-Type", "application/json");
    var params = {
        "studentnum": "u25033931",
        "apikey": "037c869ef00b1364930193a916c02d06",
        "type": "GetAllAirports",
        "page": airportPage
    };
    airReq.send(JSON.stringify(params));
}

function searchAirports(query, selectId) {
    var airSearchReq = new XMLHttpRequest();
    airSearchReq.onreadystatechange = function() {
        if (airSearchReq.readyState == 4 && airSearchReq.status == 200) {
            var response = JSON.parse(airSearchReq.responseText);
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
                opt.value = airport.id;
                opt.textContent = airport.name + " (" + airport.code + ") - " + airport.city + ", " + airport.country;
                select.appendChild(opt);
            });
        }
    };
    airSearchReq.open("POST", "https://wheatley.cs.up.ac.za/api/", true);
    airSearchReq.setRequestHeader("Content-Type", "application/json");
    var params = {
        "studentnum": "u25033931",
        "apikey": "037c869ef00b1364930193a916c02d06",
        "type": "GetAllAirports",
        "search": query
    };
    airSearchReq.send(JSON.stringify(params));
}

function searchPlanesForBooking(query) {
    var planeReq = new XMLHttpRequest();
    planeReq.onreadystatechange = function() {
        if (planeReq.readyState == 4 && planeReq.status == 200) {
            var response = JSON.parse(planeReq.responseText);
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
                    selectedPlaneId = plane.id;
                    suggestions.style.display = "none";
                    updateCabinClasses(plane.classes);
                };
                suggestions.appendChild(li);
            });
        }
    };
    planeReq.open("POST", "https://wheatley.cs.up.ac.za/api/", true);
    planeReq.setRequestHeader("Content-Type", "application/json");
    var params = {
        "studentnum": "u25033931",
        "apikey": "037c869ef00b1364930193a916c02d06",
        "type": "GetAllPlanes",
        "search": { "model": query },
        "return": "*",
        "limit": 8
    };
    planeReq.send(JSON.stringify(params));
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
                    '<a href="view.html?id=' + plane.id + '" class="btn-view">View Details</a>' +
                    '<button class="btn-fav ' + starClass + '" onclick="toggleFavorite(\'' + plane.id + '\')">&#9733;</button>' +
                '</div>' +
            '</div>';
    });
}