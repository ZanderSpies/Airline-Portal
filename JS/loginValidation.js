// Zander Spies u25033931

var loginForm     = document.getElementById("loginForm");
var emailInput    = document.getElementById("email");
var passwordInput = document.getElementById("password");
var emailError    = document.getElementById("emailError");
var passwordError = document.getElementById("passwordError");

var emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

loginForm.addEventListener("submit", function(e) {
    e.preventDefault();

    emailError.innerHTML    = "";
    passwordError.innerHTML = "";

    var valid = true;

    if (emailInput.value === "" || emailInput.value == null) {
        emailError.innerHTML = "Email is required";
        valid = false;
    } else if (!emailRegex.test(emailInput.value)) {
        emailError.innerHTML = "Please enter a valid email address";
        valid = false;
    }

    if (passwordInput.value === "" || passwordInput.value == null) {
        passwordError.innerHTML = "Password is required";
        valid = false;
    }

    if (valid) {
        submitLogin();
    }
});

function submitLogin() {
    var loginBtn = document.getElementById("loginBtn");
    loginBtn.disabled = true;
    loginBtn.value    = "Logging in...";

    var payload = {
        "type":     "Login",
        "email":    emailInput.value.trim(),
        "password": passwordInput.value
    };

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/u25033931/api.php", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            loginBtn.disabled = false;
            loginBtn.value    = "Login";

            var response;
            try {
                response = JSON.parse(xhr.responseText);
            } catch (err) {
                showLoginMessage("error", "Unexpected server error. Please try again.");
                return;
            }

            if (response.status === "success") {
                // Store API key and user name in localStorage for use across pages
                localStorage.setItem("apikey", response.data.apikey);
                localStorage.setItem("user_name", response.data.name + " " + response.data.surname);

                showLoginMessage("success", "Login successful! Redirecting...");
                setTimeout(function() {
                    window.location.href = "index.php";
                }, 1000);
            } else {
                var msg = response.data ? response.data : "Login failed. Please check your credentials.";
                showLoginMessage("error", msg);
            }
        }
    };

    xhr.send(JSON.stringify(payload));
}

function showLoginMessage(type, message) {
    var errorDiv   = document.getElementById("login-error");
    var successDiv = document.getElementById("login-success");

    errorDiv.style.display   = "none";
    successDiv.style.display = "none";

    if (type === "success") {
        successDiv.innerHTML     = message;
        successDiv.style.display = "block";
    } else {
        errorDiv.innerHTML     = message;
        errorDiv.style.display = "block";
    }
}