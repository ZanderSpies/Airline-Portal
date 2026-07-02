// Zander Spies u25033931

const nameInput            = document.getElementById("name");
const surnameInput         = document.getElementById("surname");
const emailInput           = document.getElementById("email");
const typeInput            = document.getElementById("type");
const passwordInput        = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const formInput            = document.getElementById("signUp");

const nameError            = document.getElementById("nameError");
const surnameError         = document.getElementById("surnameError");
const emailError           = document.getElementById("emailError");
const typeError            = document.getElementById("typeError");
const passwordError        = document.getElementById("passwordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");

var emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

var hasUpper  = /[A-Z]/;
var hasLower  = /[a-z]/;
var hasDigit  = /[0-9]/;
var hasSymbol = /[^A-Za-z0-9]/;

formInput.addEventListener("submit", function(e) {
    e.preventDefault();

    nameError.innerHTML            = "";
    surnameError.innerHTML         = "";
    emailError.innerHTML           = "";
    typeError.innerHTML            = "";
    passwordError.innerHTML        = "";
    confirmPasswordError.innerHTML = "";

    var valid = true;

    if (nameInput.value === "" || nameInput.value == null) {
        nameError.innerHTML = "Name is required";
        valid = false;
    } else if (nameInput.value.length < 2) {
        nameError.innerHTML = "Name needs to be longer than 1 character";
        valid = false;
    } else if (!/^[A-Za-z\s\-]+$/.test(nameInput.value)) {
        nameError.innerHTML = "Name can only contain letters";
        valid = false;
    }

    if (surnameInput.value === "" || surnameInput.value == null) {
        surnameError.innerHTML = "Surname is required";
        valid = false;
    } else if (surnameInput.value.length < 2) {
        surnameError.innerHTML = "Surname needs to be longer than 1 character";
        valid = false;
    } else if (!/^[A-Za-z\s\-]+$/.test(surnameInput.value)) {
        surnameError.innerHTML = "Surname can only contain letters";
        valid = false;
    }

    if (emailInput.value === "" || emailInput.value == null) {
        emailError.innerHTML = "Email is required";
        valid = false;
    } else if (!emailRegex.test(emailInput.value)) {
        emailError.innerHTML = "Please enter a valid email (e.g., user@example.com)";
        valid = false;
    }

    if (typeInput.value === "") {
        typeError.innerHTML = "Type is required";
        valid = false;
    }

    if (passwordInput.value === "" || passwordInput.value == null) {
        passwordError.innerHTML = "Password is required";
        valid = false;
    } else if (passwordInput.value.length < 8) {
        passwordError.innerHTML = "Password must be at least 8 characters long";
        valid = false;
    } else if (!hasUpper.test(passwordInput.value)) {
        passwordError.innerHTML = "Password must contain at least one uppercase letter";
        valid = false;
    } else if (!hasLower.test(passwordInput.value)) {
        passwordError.innerHTML = "Password must contain at least one lowercase letter";
        valid = false;
    } else if (!hasDigit.test(passwordInput.value)) {
        passwordError.innerHTML = "Password must contain at least one digit";
        valid = false;
    } else if (!hasSymbol.test(passwordInput.value)) {
        passwordError.innerHTML = "Password must contain at least one special character (e.g. !, @, #)";
        valid = false;
    }

    if (confirmPasswordInput.value === "" || confirmPasswordInput.value == null) {
        confirmPasswordError.innerHTML = "Please confirm your password";
        valid = false;
    } else if (passwordInput.value !== confirmPasswordInput.value) {
        confirmPasswordError.innerHTML = "Passwords do not match";
        valid = false;
    }

    if (valid) {
        submitRegistration();
    }
});

function submitRegistration() {
    var submitBtn = formInput.querySelector("input[type='submit']");
    submitBtn.disabled = true;
    submitBtn.value    = "Registering...";

    var payload = {
        "type":      "Register",
        "name":      nameInput.value.trim(),
        "surname":   surnameInput.value.trim(),
        "email":     emailInput.value.trim(),
        "password":  passwordInput.value,
        "user_type": typeInput.value
    };

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/u25033931/api.php", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            submitBtn.disabled = false;
            submitBtn.value    = "Sign Up";

            var response;
            try {
                response = JSON.parse(xhr.responseText);
            } catch (err) {
                showFormMessage("error", "Unexpected server error. Please try again.");
                return;
            }

            if (response.status === "success") {
                var apiKey = response.data && response.data.apikey ? response.data.apikey : "N/A";
                showFormMessage(
                    "success",
                    "Registration successful! Your API key is: <strong>" + apiKey + "</strong>. " +
                    "Please save this key as it is needed to use the API."
                );
                formInput.reset();
            } else {
                var msg = response.data ? response.data : "Registration failed. Please try again.";
                showFormMessage("error", msg);
            }
        }
    };

    xhr.send(JSON.stringify(payload));
}

function showFormMessage(type, message) {
    var old = document.getElementById("form-message");
    if (old) old.parentNode.removeChild(old);

    var div = document.createElement("div");
    div.id = "form-message";
    div.style.marginTop   = "12px";
    div.style.padding     = "10px 14px";
    div.style.borderRadius = "6px";
    div.style.fontWeight  = "500";

    if (type === "success") {
        div.style.background = "#d4edda";
        div.style.color      = "#155724";
        div.style.border     = "1px solid #c3e6cb";
    } else {
        div.style.background = "#f8d7da";
        div.style.color      = "#721c24";
        div.style.border     = "1px solid #f5c6cb";
    }

    div.innerHTML = message;
    formInput.parentNode.insertBefore(div, formInput.nextSibling);
}