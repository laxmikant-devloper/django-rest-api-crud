// =========================================
// VERIFY OTP
// =========================================

function verifyOTP() {

    const otp =
        document.getElementById("otp").value.trim();

    if (otp === "") {
        alert("Please enter OTP");
        return;
    }

    if (!/^\d{6}$/.test(otp)) {
        alert("Please enter 6 digit OTP");
        return;
    }

    const phone =
        sessionStorage.getItem("phone");

    if (!phone) {
        alert("Phone number not found");
        return;
    }

    const csrfElement =
        document.querySelector(
            '[name=csrfmiddlewaretoken]'
        );

    if (!csrfElement) {
        alert("CSRF token not found");
        return;
    }

    const csrfToken =
        csrfElement.value;

    const formData =
        new URLSearchParams();

    formData.append(
        "phone",
        phone
    );

    formData.append(
        "otp",
        otp
    );

    fetch("/verify-otp", {
        method: "POST",

        headers: {
            "Content-Type":
                "application/x-www-form-urlencoded",

            "X-CSRFToken":
                csrfToken
        },

        body: formData
    })

    .then(response => {

        if (!response.ok) {
            throw new Error(
                "Server error: " +
                response.status
            );
        }

        return response.json();
    })

    .then(data => {

        console.log(
            "OTP RESULT:",
            data
        );

        if (data.success) {

            // =================================
            // NEW USER → REGISTER
            // EXISTING USER → LOGIN
            // =================================

            if (data.new_user === true) {

                window.location.href =
                    "/register/";

            } else {

                window.location.href =
                    "/login/";

            }

        } else {

            alert(
                data.message ||
                "OTP verification failed"
            );
        }
    })

    .catch(error => {

        console.error(
            "OTP Error:",
            error
        );

        alert(
            "Unable to verify OTP. Please try again."
        );
    });
}


// =========================================
// RESEND OTP
// =========================================

function resendOTP() {

    const phone =
        sessionStorage.getItem("phone");

    if (!phone) {
        alert("Phone number not found");
        return;
    }

    const csrfElement =
        document.querySelector(
            '[name=csrfmiddlewaretoken]'
        );

    if (!csrfElement) {
        alert("CSRF token not found");
        return;
    }

    const csrfToken =
        csrfElement.value;

    const formData =
        new URLSearchParams();

    formData.append(
        "phone",
        phone
    );

    fetch("/send-phone/", {
        method: "POST",

        headers: {
            "Content-Type":
                "application/x-www-form-urlencoded",

            "X-CSRFToken":
                csrfToken
        },

        body: formData
    })

    .then(response => {

        if (!response.ok) {
            throw new Error(
                "Server error: " +
                response.status
            );
        }

        return response.json();
    })

    .then(data => {

        console.log(
            "RESEND:",
            data
        );

        if (data.success) {

            alert(
                data.message ||
                "OTP sent successfully"
            );

        } else {

            alert(
                data.message ||
                "Unable to resend OTP"
            );
        }
    })

    .catch(error => {

        console.error(
            "Resend Error:",
            error
        );

        alert(
            "Unable to resend OTP. Please try again."
        );
    });
}