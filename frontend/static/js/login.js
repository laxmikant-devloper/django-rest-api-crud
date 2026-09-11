const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("loginMessage");

    if (!email || !password) {

        message.innerText =
            "Email and password are required.";

        return;
    }

    const csrfToken =
        document.querySelector(
            '[name=csrfmiddlewaretoken]'
        ).value;

    fetch("/login-user/", {

        method: "POST",

        credentials: "same-origin",

        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken
        },

        body: JSON.stringify({
            email: email,
            password: password
        })

    })

    .then(response => response.json())

    .then(data => {

        console.log("LOGIN RESPONSE:", data);

        if (data.success) {

            message.innerText =
                data.message;

            window.location.href =
                "/dashboard/";

        } else {

            message.innerText =
                data.message;

        }

    })

    .catch(error => {

        console.error(
            "Login error:",
            error
        );

        message.innerText =
            "Something went wrong. Please try again.";

    });

});