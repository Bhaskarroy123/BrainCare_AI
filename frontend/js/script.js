
const API_URL = "http://127.0.0.1:5000";

// =====================================
// SIGNUP
// =====================================

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const terms = document.getElementById("terms").checked;

        const signupBtn = document.getElementById("signupBtn");
        const message = document.getElementById("signupMessage");

        message.textContent = "";

        if (!name || !email || !password || !confirmPassword) {
            message.textContent = "Please fill all fields.";
            return;
        }

        if (password.length < 8) {
            message.textContent =
                "Password must contain at least 8 characters.";
            return;
        }

        if (password !== confirmPassword) {
            message.textContent = "Passwords do not match.";
            return;
        }

        if (!terms) {
            message.textContent =
                "Please accept Terms & Privacy Policy.";
            return;
        }

        signupBtn.disabled = true;
        signupBtn.textContent = "Creating Account...";

        try {

            const response = await fetch(`${API_URL}/api/signup`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })

            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Account creation failed."
                );
            }

            alert("Account created successfully!");

            window.location.href = "login.html";

        } catch (error) {

            message.textContent = error.message;

        } finally {

            signupBtn.disabled = false;
            signupBtn.textContent = "Create Account";

        }

    });

}


// =====================================
// LOGIN
// =====================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const loginBtn = document.getElementById("loginBtn");
        const message = document.getElementById("loginMessage");

        message.textContent = "";

        if (!email || !password) {
            message.textContent = "Please enter email and password.";
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = "Logging In...";

        try {

            const response = await fetch(`${API_URL}/api/login`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })

            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Login failed."
                );
            }

            sessionStorage.setItem(
                "user",
                JSON.stringify(result.user)
            );

            alert("Login successful!");

            window.location.href = "dashboard.html";

        } catch (error) {

            message.textContent = error.message;

        } finally {

            loginBtn.disabled = false;
            loginBtn.textContent = "Login";

        }

    });

}
