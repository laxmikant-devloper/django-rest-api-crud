const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword =
        document.getElementById("confirmPassword").value;

    // Password match check
    if (password !== confirmPassword) {

        document.getElementById(
            "registerMessage"
        ).innerText = "Passwords do not match.";

        return;
    }

    // Password minimum length
    if (password.length < 8) {

        document.getElementById(
            "registerMessage"
        ).innerText =
            "Password must be at least 8 characters.";

        return;
    }

    const csrfToken =
        document.querySelector(
            '[name=csrfmiddlewaretoken]'
        ).value;

    fetch("/register-user/", {

        method: "POST",

        credentials: "same-origin",

        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken
        },

        body: JSON.stringify({
            name: name,
            email: email,
            password: password
        })

    })

    .then(response => response.json())

    .then(data => {

        console.log(data);

        if (data.success) {

            document.getElementById(
                "registerMessage"
            ).innerText = data.message;

            window.location.href =
                "/login/";

        } else {

            document.getElementById(
                "registerMessage"
            ).innerText =
                data.message;

        }

    })

    .catch(error => {

        console.error(
            "Registration error:",
            error
        );

        document.getElementById(
            "registerMessage"
        ).innerText =
            "Something went wrong. Please try again.";

    });

});