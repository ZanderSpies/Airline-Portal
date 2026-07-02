x<?php
//Zander Spies u25033931
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

class Database
{
    private static $instance = null;
    private $connection;

    private function __construct()
    {
        $host = 'localhost';
        $user = 'u25033931';
        $pass = '2OCIZIMUDDVGX26T3SNBE7USEAEPWNL3';
        $name = 'u25033931_airports';

        $this->connection = new mysqli($host, $user, $pass, $name);

        if ($this->connection->connect_error) {
            sendResponse(500, "error", "Database connection failed: " . $this->connection->connect_error);
            exit();
        }
        $this->connection->set_charset("utf8");
    }

    private function __clone() {}

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection()
    {
        return $this->connection;
    }
}

function sendResponse($httpCode, $status, $data)
{
    http_response_code($httpCode);
    $timestamp = round(microtime(true) * 1000);
    echo json_encode(array(
        "status"    => $status,
        "timestamp" => $timestamp,
        "data"      => $data
    ));
    exit();
}

function generateApiKey()
{
    $raw = bin2hex(openssl_random_pseudo_bytes(24));
    return substr($raw, 0, 32);
}

function generateSalt($length = 16)
{
    $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    $salt  = '';
    $max   = strlen($chars) - 1;
    for ($i = 0; $i < $length; $i++) {
        $salt .= $chars[rand(0, $max)];
    }
    return $salt;
}

function hashPassword($password, $salt)
{
    return hash('sha256', $salt . $password . $salt);
}

function validateApiKey($conn, $apikey)
{
    if (empty($apikey)) return false;
    if (!preg_match('/^[a-zA-Z0-9]+$/', $apikey)) return false;
    $stmt = $conn->prepare("SELECT id FROM users WHERE api_key = ?");
    $stmt->bind_param("s", $apikey);
    $stmt->execute();
    $result = $stmt->get_result();
    $valid  = ($result->num_rows > 0);
    $stmt->close();
    return $valid;
}

function getUserIdByApiKey($conn, $apikey)
{
    $stmt = $conn->prepare("SELECT id FROM users WHERE api_key = ?");
    $stmt->bind_param("s", $apikey);
    $stmt->execute();
    $result = $stmt->get_result();
    $row    = $result->fetch_assoc();
    $stmt->close();
    return $row ? (int)$row['id'] : null;
}

function haversineDistance($lat1, $lon1, $lat2, $lon2)
{
    $R    = 6377;
    $phi1 = deg2rad($lat1);
    $phi2 = deg2rad($lat2);
    $dphi = deg2rad($lat2 - $lat1);
    $dlam = deg2rad($lon2 - $lon1);
    $a    = sin($dphi / 2) ** 2 + cos($phi1) * cos($phi2) * sin($dlam / 2) ** 2;
    $c    = 2 * asin(sqrt($a));
    return $R * $c;
}

function calculateFlightTime($distance, $vmax, $rmax, $cargo, $seats)
{
    $vc = $vmax * (1 - 0.2 * $cargo / ($cargo + 80 * $seats));

    if ($seats > 300)       $tBase = 20;
    elseif ($seats > 200)   $tBase = 15;
    elseif ($seats > 100)   $tBase = 10;
    elseif ($seats > 50)    $tBase = 7;
    else                    $tBase = 5;

    $k              = 0.001;
    $tClimbDescent  = $tBase * (1 - exp(-$k * $distance));
    $ttotal         = ($distance / $vc) * 60 + $tClimbDescent + 15;
    return round($ttotal);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(405, "error", "Only POST method is allowed");
}

$body = file_get_contents("php://input");
$data = json_decode($body, true);

if ($data === null || !isset($data['type'])) {
    sendResponse(400, "error", "Post parameters are missing");
}

$type = trim($data['type']);

switch ($type) {
    case 'Register':       handleRegister($data);      break;
    case 'Login':          handleLogin($data);         break;
    case 'GetAllPlanes':   handleGetAllPlanes($data);   break;
    case 'GetAllAirports': handleGetAllAirports($data); break;
    case 'AddFavorite':    handleAddFavorite($data);    break;
    case 'RemoveFavorite': handleRemoveFavorite($data); break;
    case 'GetFavorites':   handleGetFavorites($data);   break;
    case 'BookFlight':     handleBookFlight($data);      break;
    case 'GetBookings':    handleGetBookings($data);    break;
    case 'DeleteBooking':  handleDeleteBooking($data);  break;
    default:
        sendResponse(400, "error", "Unknown type: " . htmlspecialchars($type));
}

function handleRegister($data)
{
    $required = array('name', 'surname', 'email', 'password', 'user_type');
    foreach ($required as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            sendResponse(400, "error", "Missing required field: " . $field);
        }
    }

    $name      = trim($data['name']);
    $surname   = trim($data['surname']);
    $email     = trim($data['email']);
    $password  = $data['password'];
    $user_type = trim($data['user_type']);

    if (strlen($name) < 2 || !preg_match('/^[A-Za-z\s\-]+$/', $name)) {
        sendResponse(400, "error", "Invalid name. Must be at least 2 characters and contain only letters.");
    }
    if (strlen($surname) < 2 || !preg_match('/^[A-Za-z\s\-]+$/', $surname)) {
        sendResponse(400, "error", "Invalid surname. Must be at least 2 characters and contain only letters.");
    }
    if (!preg_match('/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/', $email)) {
        sendResponse(400, "error", "Invalid email address.");
    }
    if (strlen($password) < 8)                    sendResponse(400, "error", "Password must be at least 8 characters long.");
    if (!preg_match('/[A-Z]/', $password))        sendResponse(400, "error", "Password must contain at least one uppercase letter.");
    if (!preg_match('/[a-z]/', $password))        sendResponse(400, "error", "Password must contain at least one lowercase letter.");
    if (!preg_match('/[0-9]/', $password))        sendResponse(400, "error", "Password must contain at least one digit.");
    if (!preg_match('/[^A-Za-z0-9]/', $password)) sendResponse(400, "error", "Password must contain at least one special character.");

    $allowed_types = array('Passenger', 'ATC', 'passenger', 'atc');
    if (!in_array($user_type, $allowed_types)) {
        sendResponse(400, "error", "Invalid user type. Must be 'Passenger' or 'ATC'.");
    }
    $user_type = ucfirst(strtolower($user_type));

    $conn = Database::getInstance()->getConnection();

    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        $stmt->close();
        sendResponse(409, "error", "Email address is already in use.");
    }
    $stmt->close();

    $salt           = generateSalt(16);
    $hashedPassword = hashPassword($password, $salt);
    $storedPassword = $salt . ':' . $hashedPassword;
    $apiKey         = generateApiKey();

    $stmt = $conn->prepare(
        "INSERT INTO users (name, surname, email, password, type, api_key) VALUES (?, ?, ?, ?, ?, ?)"
    );
    $stmt->bind_param("ssssss", $name, $surname, $email, $storedPassword, $user_type, $apiKey);

    if ($stmt->execute()) {
        $stmt->close();
        sendResponse(200, "success", array("apikey" => $apiKey));
    } else {
        $stmt->close();
        sendResponse(500, "error", "Failed to register user. Please try again.");
    }
}

function handleLogin($data)
{
    if (!isset($data['email']) || !isset($data['password']) ||
        trim($data['email']) === '' || $data['password'] === '') {
        sendResponse(400, "error", "Email and password are required.");
    }

    $email    = trim($data['email']);
    $password = $data['password'];

    if (!preg_match('/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/', $email)) {
        sendResponse(400, "error", "Invalid email address.");
    }

    $conn = Database::getInstance()->getConnection();
    $stmt = $conn->prepare("SELECT id, name, surname, password, api_key, type FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $stmt->close();
        sendResponse(401, "error", "Invalid email or password.");
    }

    $user = $result->fetch_assoc();
    $stmt->close();

    $parts = explode(':', $user['password'], 2);
    if (count($parts) !== 2) {
        sendResponse(500, "error", "Internal server error.");
    }

    $salt       = $parts[0];
    $storedHash = $parts[1];
    $inputHash  = hashPassword($password, $salt);

    if (!hash_equals($storedHash, $inputHash)) {
        sendResponse(401, "error", "Invalid email or password.");
    }

    sendResponse(200, "success", array(
        "apikey"  => $user['api_key'],
        "name"    => $user['name'],
        "surname" => $user['surname'],
        "type"    => $user['type'],
        "user_id" => $user['id']
    ));
}

function handleGetAllPlanes($data)
{
    $conn = Database::getInstance()->getConnection();

    if (!isset($data['apikey']) || !validateApiKey($conn, $data['apikey'])) {
        sendResponse(400, "error", "Invalid or missing API key.");
    }

    $allowedColumns = array('id', 'manufacturer', 'model', 'seats', 'max_range_km',
                            'max_speed_kmh', 'max_cargo_kg', 'image_url', 'description', 'classes');

    $returnCols = '*';
    if (isset($data['return']) && $data['return'] !== '*') {
        $cols     = is_array($data['return']) ? $data['return'] : array($data['return']);
        $safeCols = array();
        foreach ($cols as $col) {
            if (in_array($col, $allowedColumns)) {
                $safeCols[] = '`' . $col . '`';
            }
        }
        if (!empty($safeCols)) $returnCols = implode(', ', $safeCols);
    }

    $sql          = "SELECT " . $returnCols . " FROM planes";
    $params       = array();
    $types        = '';
    $whereClauses = array();

    if (isset($data['search']) && is_array($data['search'])) {
        foreach ($data['search'] as $col => $val) {
            if (in_array($col, $allowedColumns)) {
                if ($col === 'id') {
                    $whereClauses[] = '`id` = ?';
                    $types         .= 'i';
                    $params[]       = (int)$val;
                } else {
                    $whereClauses[] = '`' . $col . '` LIKE ?';
                    $types         .= 's';
                    $params[]       = '%' . $val . '%';
                }
            }
        }
    } elseif (isset($data['fuzzy']) && is_string($data['fuzzy'])) {
        $fuzzy          = '%' . $data['fuzzy'] . '%';
        $whereClauses[] = '(`manufacturer` LIKE ? OR `model` LIKE ?)';
        $types         .= 'ss';
        $params[]       = $fuzzy;
        $params[]       = $fuzzy;
    }

    if (!empty($whereClauses)) $sql .= ' WHERE ' . implode(' AND ', $whereClauses);

    $allowedSortCols = array('id', 'manufacturer', 'model', 'seats', 'max_range_km', 'max_speed_kmh');
    if (isset($data['sort']) && in_array($data['sort'], $allowedSortCols)) {
        $order = (isset($data['order']) && strtoupper($data['order']) === 'ASC') ? 'ASC' : 'DESC';
        $sql  .= ' ORDER BY `' . $data['sort'] . '` ' . $order;
    }

    if (isset($data['limit'])) {
        if (!is_numeric($data['limit']) || (int)$data['limit'] < 2 || (int)$data['limit'] > 100) {
            sendResponse(400, "error", "Invalid limit. Must be an integer between 2 and 100.");
        }
        $limit    = (int)$data['limit'];
        $sql     .= ' LIMIT ?';
        $types   .= 'i';
        $params[] = $limit;
    }

    if (!empty($params)) {
        $stmt     = $conn->prepare($sql);
        $bindArgs = array($types);
        foreach ($params as &$param) $bindArgs[] = &$param;
        call_user_func_array(array($stmt, 'bind_param'), $bindArgs);
        $stmt->execute();
        $result = $stmt->get_result();
        $stmt->close();
    } else {
        $result = $conn->query($sql);
    }

    if (!$result) sendResponse(500, "error", "Database query failed.");

    $planes = array();
    while ($row = $result->fetch_assoc()) $planes[] = $row;
    sendResponse(200, "success", $planes);
}

function handleGetAllAirports($data)
{
    $conn = Database::getInstance()->getConnection();

    if (!isset($data['apikey']) || !validateApiKey($conn, $data['apikey'])) {
        sendResponse(400, "error", "Invalid or missing API key.");
    }

    $allowedColumns = array('id', 'name', 'code', 'city', 'country', 'latitude', 'longitude');

    $sql          = "SELECT * FROM airports";
    $params       = array();
    $types        = '';
    $whereClauses = array();

    if (isset($data['search']) && is_string($data['search']) && strlen(trim($data['search'])) > 0) {
        $term           = '%' . trim($data['search']) . '%';
        $whereClauses[] = '(`name` LIKE ? OR `city` LIKE ? OR `country` LIKE ? OR `code` LIKE ?)';
        $types         .= 'ssss';
        $params[]       = $term;
        $params[]       = $term;
        $params[]       = $term;
        $params[]       = $term;
    } elseif (isset($data['search']) && is_array($data['search'])) {
        foreach ($data['search'] as $col => $val) {
            if (in_array($col, $allowedColumns)) {
                if ($col === 'id') {
                    $whereClauses[] = '`id` = ?';
                    $types         .= 'i';
                    $params[]       = (int)$val;
                } else {
                    $whereClauses[] = '`' . $col . '` LIKE ?';
                    $types         .= 's';
                    $params[]       = '%' . $val . '%';
                }
            }
        }
    }

    if (!empty($whereClauses)) $sql .= ' WHERE ' . implode(' AND ', $whereClauses);

    $pageSize = 50;
    $page     = (isset($data['page']) && (int)$data['page'] > 0) ? (int)$data['page'] : 1;
    $offset   = ($page - 1) * $pageSize;

    $sql    .= ' LIMIT ? OFFSET ?';
    $types  .= 'ii';
    $params[] = $pageSize;
    $params[] = $offset;

    $stmt     = $conn->prepare($sql);
    $bindArgs = array($types);
    foreach ($params as &$param) $bindArgs[] = &$param;
    call_user_func_array(array($stmt, 'bind_param'), $bindArgs);
    $stmt->execute();
    $result = $stmt->get_result();
    $stmt->close();

    $airports = array();
    while ($row = $result->fetch_assoc()) $airports[] = $row;
    sendResponse(200, "success", $airports);
}

function handleAddFavorite($data)
{
    $conn = Database::getInstance()->getConnection();

    if (!isset($data['apikey']) || !validateApiKey($conn, $data['apikey'])) {
        sendResponse(400, "error", "Invalid or missing API key.");
    }
    if (!isset($data['plane_id']) || !is_numeric($data['plane_id'])) {
        sendResponse(400, "error", "Missing or invalid plane_id.");
    }

    $userId  = getUserIdByApiKey($conn, $data['apikey']);
    $planeId = (int)$data['plane_id'];

    $stmt = $conn->prepare("SELECT id FROM planes WHERE id = ?");
    $stmt->bind_param("i", $planeId);
    $stmt->execute();
    if ($stmt->get_result()->num_rows === 0) {
        $stmt->close();
        sendResponse(404, "error", "Plane not found.");
    }
    $stmt->close();

    $stmt = $conn->prepare("SELECT id FROM favorites WHERE user_id = ? AND plane_id = ?");
    $stmt->bind_param("ii", $userId, $planeId);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        $stmt->close();
        sendResponse(409, "error", "Plane is already in favorites.");
    }
    $stmt->close();

    $stmt = $conn->prepare("INSERT INTO favorites (user_id, plane_id) VALUES (?, ?)");
    $stmt->bind_param("ii", $userId, $planeId);
    if ($stmt->execute()) {
        $stmt->close();
        sendResponse(200, "success", "Plane added to favorites.");
    } else {
        $stmt->close();
        sendResponse(500, "error", "Failed to add favorite.");
    }
}

function handleRemoveFavorite($data)
{
    $conn = Database::getInstance()->getConnection();

    if (!isset($data['apikey']) || !validateApiKey($conn, $data['apikey'])) {
        sendResponse(400, "error", "Invalid or missing API key.");
    }
    if (!isset($data['plane_id']) || !is_numeric($data['plane_id'])) {
        sendResponse(400, "error", "Missing or invalid plane_id.");
    }

    $userId  = getUserIdByApiKey($conn, $data['apikey']);
    $planeId = (int)$data['plane_id'];

    $stmt = $conn->prepare("DELETE FROM favorites WHERE user_id = ? AND plane_id = ?");
    $stmt->bind_param("ii", $userId, $planeId);
    if ($stmt->execute()) {
        $stmt->close();
        sendResponse(200, "success", "Plane removed from favorites.");
    } else {
        $stmt->close();
        sendResponse(500, "error", "Failed to remove favorite.");
    }
}

function handleGetFavorites($data)
{
    $conn = Database::getInstance()->getConnection();

    if (!isset($data['apikey']) || !validateApiKey($conn, $data['apikey'])) {
        sendResponse(400, "error", "Invalid or missing API key.");
    }

    $userId = getUserIdByApiKey($conn, $data['apikey']);

    $stmt = $conn->prepare(
        "SELECT p.* FROM planes p
         INNER JOIN favorites f ON p.id = f.plane_id
         WHERE f.user_id = ?"
    );
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $stmt->close();

    $planes = array();
    while ($row = $result->fetch_assoc()) $planes[] = $row;
    sendResponse(200, "success", $planes);
}

function handleBookFlight($data)
{
    $conn = Database::getInstance()->getConnection();

    if (!isset($data['apikey']) || !validateApiKey($conn, $data['apikey'])) {
        sendResponse(400, "error", "Invalid or missing API key.");
    }

    $required = array('plane_id', 'departure_code', 'arrival_code', 'departure_date', 'passengers', 'cabin_class');
    foreach ($required as $field) {
        if (!isset($data[$field]) || trim((string)$data[$field]) === '') {
            sendResponse(400, "error", "Missing required field: " . $field);
        }
    }

    $userId        = getUserIdByApiKey($conn, $data['apikey']);
    $planeId       = (int)$data['plane_id'];
    $depCode       = strtoupper(trim($data['departure_code']));
    $arrCode       = strtoupper(trim($data['arrival_code']));
    $depDate       = trim($data['departure_date']);
    $passengers    = (int)$data['passengers'];
    $cabinClass    = trim($data['cabin_class']);
    $isReturn      = isset($data['is_return']) && $data['is_return'];
    $returnDate    = isset($data['return_date']) ? trim($data['return_date']) : null;

    if ($passengers < 1) sendResponse(400, "error", "Passengers must be at least 1.");
    if ($depCode === $arrCode) sendResponse(400, "error", "Departure and arrival airports must differ.");

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $depDate)) {
        sendResponse(400, "error", "Invalid departure date format. Use YYYY-MM-DD.");
    }

    $stmt = $conn->prepare("SELECT * FROM planes WHERE id = ?");
    $stmt->bind_param("i", $planeId);
    $stmt->execute();
    $planeRow = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$planeRow) sendResponse(404, "error", "Plane not found.");

    $stmt = $conn->prepare("SELECT * FROM airports WHERE code = ?");
    $stmt->bind_param("s", $depCode);
    $stmt->execute();
    $depAirport = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$depAirport) sendResponse(404, "error", "Departure airport not found.");

    $stmt = $conn->prepare("SELECT * FROM airports WHERE code = ?");
    $stmt->bind_param("s", $arrCode);
    $stmt->execute();
    $arrAirport = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$arrAirport) sendResponse(404, "error", "Arrival airport not found.");

    $distance   = haversineDistance(
        (float)$depAirport['latitude'], (float)$depAirport['longitude'],
        (float)$arrAirport['latitude'], (float)$arrAirport['longitude']
    );
    $flightMins = calculateFlightTime(
        $distance,
        (float)$planeRow['max_speed_kmh'],
        (float)$planeRow['max_range_km'],
        (float)$planeRow['max_cargo_kg'],
        (int)$planeRow['seats']
    );

    $bookingIds = array();

    $flightId = findOrCreateFlight($conn, $planeId, $depCode, $arrCode, $depDate, $flightMins, round($distance));
    $result   = bookSeat($conn, $flightId, $userId, $passengers, (int)$planeRow['seats'], $cabinClass);
    if ($result !== true) sendResponse(409, "error", $result);
    $bookingIds[] = $conn->insert_id;

    if ($isReturn && $returnDate) {
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $returnDate)) {
            sendResponse(400, "error", "Invalid return date format. Use YYYY-MM-DD.");
        }
        $retFlightId = findOrCreateFlight($conn, $planeId, $arrCode, $depCode, $returnDate, $flightMins, round($distance));
        $retResult   = bookSeat($conn, $retFlightId, $userId, $passengers, (int)$planeRow['seats'], $cabinClass);
        if ($retResult !== true) sendResponse(409, "error", "Return flight: " . $retResult);
        $bookingIds[] = $conn->insert_id;
    }

    sendResponse(200, "success", array(
        "message"     => "Booking confirmed!",
        "booking_ids" => $bookingIds,
        "distance_km" => round($distance),
        "flight_mins" => $flightMins
    ));
}

function findOrCreateFlight($conn, $planeId, $depCode, $arrCode, $depDate, $flightMins, $distance)
{
    $stmt = $conn->prepare(
        "SELECT id FROM flights WHERE plane_id = ? AND departure_airport_code = ? AND arrival_airport_code = ? AND departure_date = ?"
    );
    $stmt->bind_param("isss", $planeId, $depCode, $arrCode, $depDate);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if ($row) return (int)$row['id'];

    $stmt = $conn->prepare(
        "INSERT INTO flights (plane_id, departure_airport_code, arrival_airport_code, departure_date, flight_time, distance) VALUES (?, ?, ?, ?, ?, ?)"
    );
    $stmt->bind_param("isssii", $planeId, $depCode, $arrCode, $depDate, $flightMins, $distance);
    $stmt->execute();
    $newId = (int)$conn->insert_id;
    $stmt->close();
    return $newId;
}

function bookSeat($conn, $flightId, $userId, $passengers, $totalSeats, $cabinClass)
{
    $stmt = $conn->prepare("SELECT COALESCE(SUM(passengers), 0) AS booked FROM bookings WHERE flight_id = ?");
    $stmt->bind_param("i", $flightId);
    $stmt->execute();
    $row    = $stmt->get_result()->fetch_assoc();
    $booked = (int)$row['booked'];
    $stmt->close();

    if ($booked + $passengers > $totalSeats) {
        $available = $totalSeats - $booked;
        return "Not enough seats. Only " . $available . " seat(s) available on this flight.";
    }

    $stmt = $conn->prepare(
        "INSERT INTO bookings (flight_id, user_id, passengers, cabin_class) VALUES (?, ?, ?, ?)"
    );
    $stmt->bind_param("iiis", $flightId, $userId, $passengers, $cabinClass);
    $stmt->execute();
    $stmt->close();
    return true;
}

function handleGetBookings($data)
{
    $conn = Database::getInstance()->getConnection();

    if (!isset($data['apikey']) || !validateApiKey($conn, $data['apikey'])) {
        sendResponse(400, "error", "Invalid or missing API key.");
    }

    $userId = getUserIdByApiKey($conn, $data['apikey']);

    $stmt = $conn->prepare(
        "SELECT b.id AS booking_id, b.passengers, b.cabin_class,
                f.id AS flight_id, f.departure_airport_code, f.arrival_airport_code,
                f.departure_date, f.flight_time, f.distance,
                p.manufacturer, p.model, p.seats
         FROM bookings b
         INNER JOIN flights f ON b.flight_id = f.id
         INNER JOIN planes p  ON f.plane_id  = p.id
         WHERE b.user_id = ?
         ORDER BY f.departure_date ASC"
    );
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $stmt->close();

    $bookings = array();
    while ($row = $result->fetch_assoc()) $bookings[] = $row;
    sendResponse(200, "success", $bookings);
}

function handleDeleteBooking($data)
{
    $conn = Database::getInstance()->getConnection();

    if (!isset($data['apikey']) || !validateApiKey($conn, $data['apikey'])) {
        sendResponse(400, "error", "Invalid or missing API key.");
    }
    if (!isset($data['booking_id']) || !is_numeric($data['booking_id'])) {
        sendResponse(400, "error", "Missing or invalid booking_id.");
    }

    $userId    = getUserIdByApiKey($conn, $data['apikey']);
    $bookingId = (int)$data['booking_id'];

    $stmt = $conn->prepare("SELECT id FROM bookings WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $bookingId, $userId);
    $stmt->execute();
    if ($stmt->get_result()->num_rows === 0) {
        $stmt->close();
        sendResponse(403, "error", "Booking not found or access denied.");
    }
    $stmt->close();

    $stmt = $conn->prepare("DELETE FROM bookings WHERE id = ?");
    $stmt->bind_param("i", $bookingId);
    if ($stmt->execute()) {
        $stmt->close();
        sendResponse(200, "success", "Booking deleted.");
    } else {
        $stmt->close();
        sendResponse(500, "error", "Failed to delete booking.");
    }
}