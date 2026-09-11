// ======================================
// PROFILE PAGE
// ======================================

let refreshTimer;


// ======================================
// LOAD CURRENT PROFILE
// ======================================

function loadProfile() {

    fetch("/profile/", {

        method: "GET",

        credentials: "same-origin"

    })

    .then(response => {

        if (response.status === 401) {

            return refreshAccessToken()
                .then(() => {

                    return fetch("/profile/", {

                        method: "GET",

                        credentials: "same-origin"

                    });

                });

        }

        return response;

    })

    .then(response => {

        if (!response.ok) {

            throw new Error("Profile request failed: " + response.status );

        }

        return response.json();

    })

    .then(data => {

        console.log(
            "PROFILE DATA:",
            data
        );


        if (data.success) {

            // PROFILE PHOTO

            const profilePhoto =
                document.getElementById("dashboardProfilePhoto");

            if (profilePhoto && data.photo) {
                profilePhoto.src = data.photo;
            }

            // USER ID

            const userId = document.getElementById("userId");

            if (userId) {

                userId.innerText = data.user_id || "";

            }


            // PHONE

            const phone = document.getElementById("phone");

            if (phone) {

                phone.innerText = data.phone || "";

            }


            // NAME

            const name =
                document.getElementById("name");

            if (name) {

                name.innerText = data.name || "";

            }


            // EMAIL

            const email = document.getElementById("email");

            if (email) {

                email.innerText = data.email || "";

            }


            // MESSAGE

            const message = document.getElementById("message");

            if (message && data.message) {

                message.innerText = data.message;

            }

        }

        else {

            const message = document.getElementById("message");

            if (message) {

                message.innerText =  data.detail ||  data.message ||  "Unable to load profile.";

            }

        }

    })

    .catch(error => {

        console.error("Authentication failed:",error);

    });

}


// ======================================
// REFRESH ACCESS TOKEN
// ======================================

function refreshAccessToken() {

    return fetch("/token/refresh/", {

        method: "POST",

        credentials: "same-origin"

    })

    .then(response => {

        if (!response.ok) {

            throw new Error("Refresh token expired" );

        }

        return response.json();

    })

    .then(data => {

        console.log("Access token refreshed successfully" );

        return data;

    });

}


// ==============startTokenRefreshTimer========================
// AUTOMATIC TOKEN REFRESH
// ======================================

function startTokenRefreshTimer() {

    clearTimeout(refreshTimer);


    refreshTimer = setTimeout(() => {

        refreshAccessToken()

            .then(() => {

                console.log( "Automatic token refresh successful" );

                loadProfile();

                startTokenRefreshTimer();

            })

            .catch(error => {

                console.error("Automatic refresh failed:", error );

                logout();

            });

    }, 110 * 1000);

}


// ======================================
// LOGOUT
// ======================================

function logout() {

    console.log("LOGOUT BUTTON CLICKED");


    clearTimeout(refreshTimer);


    const csrfElement = document.querySelector(
            '[name=csrfmiddlewaretoken]'
        );


    const csrfToken = csrfElement ? csrfElement.value : "";


    fetch("/logout/", {

        method: "POST",

        credentials: "same-origin",

        headers: {

            "X-CSRFToken": csrfToken

        }

    })

    .then(response => {

        if (!response.ok) {

            throw new Error("Logout failed: " +
                response.status
            );

        }

        return response.json();

    })

    .then(data => {

        console.log( "LOGOUT RESPONSE:",data );

        window.location.href = "/phone/";

    })

    .catch(error => {

        console.error( "Logout error:", error);

    });

}


// ======================================
// EDIT PROFILE BUTTON
// ======================================

const editBtn = document.getElementById("editBtn");


if (editBtn) {

    editBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "/edit-profile/";

        }
    );

}


// ======================================
// LOGOUT BUTTON
// ======================================

const logoutBtn = document.getElementById("logoutBtn");


if (logoutBtn) {

    console.log("LOGOUT BUTTON:", logoutBtn);

    logoutBtn.addEventListener( "click",
         function (event) {

            /*
             * Prevent normal link
             * navigation.
             */

            event.preventDefault();

            logout();

        }
    );

}


// ======================================
// PAGE LOAD
// ======================================

loadProfile();

startTokenRefreshTimer();



