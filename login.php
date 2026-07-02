<!-- Zander Spies u25033931 -->
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login</title>
        <link rel="stylesheet" type="text/css" href="css/nav.css">
        <link rel="stylesheet" type="text/css" href="css/login.css">
        <link rel="icon" type="image/x-icon" href="img/logo.png">
    </head>
    <body>
        <header>
            <nav id="navbar">
                <?php include 'header.php'; ?>
            </nav>
        </header>

        <div class="content">
            <h1>Login</h1>
            <p>Welcome back! Please enter your credentials to continue.</p>

            <div id="login-error" class="error-msg" style="display:none;"></div>
            <div id="login-success" class="success-msg" style="display:none;"></div>

            <form id="loginForm">
                <fieldset>
                    <legend>Login</legend>

                    <label for="email">Email address*:</label>
                    <input type="text" name="email" id="email" placeholder="user@example.com">
                    <br/>
                    <span id="emailError" class="field-error"></span>

                    <br/>

                    <label for="password">Password*:</label>
                    <input type="password" name="password" id="password" placeholder="Your password">
                    <br/>
                    <span id="passwordError" class="field-error"></span>

                    <br/>

                    <input type="submit" value="Login" id="loginBtn">
                </fieldset>
            </form>

            <p class="redirect-msg">Don't have an account? <a href="signup.php" style="color: red;">Sign up here</a></p>
        </div>

        <script src="JS/loginValidation.js"></script>
    </body>
</html>