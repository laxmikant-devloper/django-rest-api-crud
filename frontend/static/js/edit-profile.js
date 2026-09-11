// ======================================
// LOAD CURRENT PROFILE
// ======================================

function loadProfile() {

    fetch("/profile/", {
        method: "GET",
        credentials: "same-origin"
    })

    .then(response => {

        if (!response.ok) {
            throw new Error(
                "Profile request failed: " +
                response.status
            );
        }

        return response.json();
    })

    .then(data => {

        if (!data.success) {
            return;
        }

        document.getElementById("editName").value =
            data.name || "";

        document.getElementById("editEmail").value =
            data.email || "";

        const phoneInput =
            document.getElementById("editPhone");

        if (phoneInput) {
            phoneInput.value =
                data.phone || "";
        }
                // PROFILE PHOTO
        const profilePhoto =
            document.getElementById("editProfilePhoto");

        if (profilePhoto && data.photo) {
            profilePhoto.src = data.photo;
        }

    })

    .catch(error => {

        console.error(
            "Profile loading error:",
            error
        );

    });

}


// ======================================
// UPDATE PROFILE
// ======================================

document
    .getElementById("updateBtn")
    .addEventListener("click", function () {

        const name =
            document.getElementById("editName")
                .value
                .trim();

        const email =
            document.getElementById("editEmail")
                .value
                .trim();

        const phone =
            document.getElementById("editPhone")
                .value
                .trim();

        const photoInput =
            document.getElementById("editfile");

        const message =
            document.getElementById("message");


        // ==================================
        // VALIDATION
        // ==================================

        if (!name || !email || !phone) {

            message.innerText =
                "Name, email and phone are required.";

            message.style.color = "red";

            return;
        }


        // ==================================
        // FORM DATA
        // ==================================

        const formData = new FormData();

        formData.append("name", name);

        formData.append("email", email);

        formData.append("phone", phone);


        // ==================================
        // PHOTO
        // ==================================
// ==================================
// PHOTO
// ==================================

console.log("PHOTO INPUT:", photoInput);
console.log("PHOTO FILES:", photoInput ? photoInput.files : null);

    if (
        photoInput &&
        photoInput.files &&
        photoInput.files.length > 0
    ) {

        console.log(
            "PHOTO SELECTED:",
            photoInput.files[0]
        );

        formData.append(
            "photo",
            photoInput.files[0]
        );

    } else {

        console.log("NO PHOTO SELECTED");

    }


        // ==================================
        // CSRF
        // ==================================

        const csrfElement =
            document.querySelector(
                '[name=csrfmiddlewaretoken]'
            );

        const csrfToken =
            csrfElement
                ? csrfElement.value
                : "";


        // ==================================
        // UPDATE REQUEST
        // ==================================

        fetch("/update-profile/", {

            method: "PUT",

            credentials: "same-origin",

            headers: {
                "X-CSRFToken": csrfToken
            },

            body: formData

        })

        .then(response => response.json())

        // .then(data => {

        //     if (data.success) {

        //         message.innerText =
        //             data.message ||
        //             "Profile updated successfully.";

        //         message.style.color = "green";

        //         setTimeout(() => {

        //             window.location.href =
        //                 "/dashboard/";

        //         }, 800);

        //     }

        //     else {

        //         message.innerText =
        //             data.message ||
        //             "Profile update failed.";

        //         message.style.color = "red";

        //     }

        // })
        .then(data => {

            console.log("UPDATE RESPONSE:", data);
            console.log("DEBUG FILES:", data.debug_files);

            if (data.success) {

                message.innerText =
                    data.message ||
                    "Profile updated successfully.";

                message.style.color = "green";

                setTimeout(() => {

                    window.location.href =
                        "/dashboard/";

                }, 800);

            }

            else {

                message.innerText =
                    data.message ||
                    "Profile update failed.";

                message.style.color = "red";

            }

        })

        .catch(error => {

            console.error(
                "Update error:",
                error
            );

            message.innerText =
                "Profile update failed.";

            message.style.color = "red";

        });

    });


// ======================================
// CANCEL
// ======================================

document
    .getElementById("cancelBtn")
    .addEventListener("click", function () {

        window.location.href =
            "/dashboard/";

    });


// ======================================
// PAGE LOAD
// ======================================

loadProfile();