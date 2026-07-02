<!-- Zander Spies u25033931 -->
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sign Up</title>
        <link rel="stylesheet" type="text/css" href="css/nav.css">
        <link rel="stylesheet" type="text/css" href="css/signup.css">
        <link rel="icon" type="image/x-icon" href="img/logo.png">
    </head>
    <body>
        <header>
            <nav id="navbar">
                <?php include 'header.php';?>
            </nav>
        </header>
        
        <div class="content">
        <h1>Sign Up</h1>
        <p>
            Please complete the form below to create a profile!
        </p>
        <p>
            <strong>Take note!</strong> All fields with an asterisk (*) is required!
        </p>
        <form id="signUp">
            <fieldset>
                <legend>Sign Up</legend>
                <label for="name">Name*:</label>
                <input type="text" name="name" id="name">
                <br/>
                <span id="nameError"></span>
                <label for="surname">Surname*:</label>
                <input type="text" name="surname" id="surname">
                <br/>
                <span id="surnameError"></span>
                <br/>
                <label for="email">Email address*:</label>
                <input type="text" name="email" id="email">
                <br/>
                <span id="emailError"></span>
                <br/>
                <label for="type">Type*:</label>
                <select name="type" id="type">
                    <option value="">Select an option</option>
                    <option value="passenger">Passenger</option>
                    <option value="atc">ATC</option>
                </select>
                <br/>
                <span id = "typeError"></span>
                <br/>
                <label for="password">Password*:</label>
                <input type="password" name="password" id="password">
                <br/>
                <span id = "passwordError"></span>
                <br/>
                <label for="confirmPassword">Confirm Password*:</label>
                <input type="password" name="confirmPassword" id="confirmPassword">
                <br/>
                <span id = "confirmPasswordError"></span>
                <br/>
                <input type="submit" value="Sign Up">
            </fieldset>
        </form>
        </div>
        <script src="JS/formValidation.js"></script>
    </body>
</html>