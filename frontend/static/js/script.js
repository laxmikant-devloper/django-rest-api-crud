
/* =====================================================
   DASHBOARD SECTION
   ===================================================== */

function loadDashboardUser() {

    fetch("/profile/", {

        method: "GET",

        credentials: "same-origin"

    })

    .then(response => {

        console.log(
            "PROFILE STATUS:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                "Authentication failed"
            );

        }


        return response.json();

    })

    .then(data => {

        console.log(
            "========== PROFILE DATA =========="
        );

        console.log(
            "FULL DATA:",
            data
        );


        if (!data.success) {

            console.error(
                data.message
            );

            return;

        }


        /* ==============================
           DASHBOARD NAME
           ============================== */

        const dashboardName =
            document.getElementById(
                "dashboardName"
            );


        if (dashboardName) {

            dashboardName.innerText =
                "Welcome back, " +
                data.name +
                " 👋";

        }


        /* ==============================
           PROFILE NAME
           ============================== */

        const profileName =
            document.getElementById(
                "profileName"
            );


        if (profileName) {

            profileName.innerText =
                data.name;

        }


        /* ==============================
           PROFILE EMAIL
           ============================== */

        const profileEmail =
            document.getElementById(
                "profileEmail"
            );


        if (profileEmail) {

            profileEmail.innerText =
                data.email;

        }


        /* ==============================
           PROFILE PHONE
           ============================== */

        const profilePhone =
            document.getElementById(
                "profilePhone"
            );


        if (profilePhone) {

            profilePhone.innerText =
                "+91 " + data.phone;

        }


        /* ==============================
           PROFILE PHOTO
           ============================== */

        const dashboardProfilePhoto =
            document.getElementById(
                "dashboardProfilePhoto"
            );


        if (
            dashboardProfilePhoto &&
            data.photo
        ) {

            dashboardProfilePhoto.src =
                data.photo;

        }

    })

    .catch(error => {

        console.error(
            "Dashboard user error:",
            error
        );

    });

}


/* =====================================================
   DASHBOARD INITIALIZATION
   ===================================================== */

if (
    document.getElementById(
        "dashboardName"
    )
) {

    loadDashboardUser();

}