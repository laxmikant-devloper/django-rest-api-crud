document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("forgetForm");
    const message = document.getElementById("forgetMessage");

    let otpVerified = false;
    let verifiedOTP = "";

    function showMessage(text, success = false) {
        message.textContent = text;
        message.style.color = success ? "#16a34a" : "#e53935";
    }

    function getCSRFToken() {
        const csrfInput = document.querySelector(
            '#forgetForm input[name="csrfmiddlewaretoken"]'
        );

        return csrfInput ? csrfInput.value : "";
    }


    // ==========================================
    // SEND OTP
    // ==========================================

    window.sendForgotOTP = async function () {

        const phone = document.getElementById("phone").value.trim();

        if (!phone) {
            showMessage("Please enter phone number.");
            return;
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            showMessage("Please enter a valid 10 digit phone number.");
            return;
        }

        const btn = document.getElementById("sendOtpBtn");

        btn.disabled = true;
        btn.textContent = "Sending OTP...";

        try {

            const response = await fetch(
                "/forgot-password/send-otp/",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": getCSRFToken()
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        phone: phone
                    })
                }
            );

            const data = await response.json();

            if (data.success) {

                showMessage(
                    "OTP sent successfully. Check your Django terminal.",
                    true
                );

                document.getElementById(
                    "forgotOTPBox"
                ).style.display = "block";

            } else {

                showMessage(
                    data.message || "OTP could not be sent."
                );
            }

        } catch (error) {

            console.error("SEND OTP ERROR:", error);

            showMessage(
                "Server error. Please check Django terminal."
            );

        } finally {

            btn.disabled = false;
            btn.textContent = "📱  Send OTP";
        }
    };


    // ==========================================
    // VERIFY OTP
    // ==========================================

window.verifyForgotOTP = async function () {

    const phone =
        document.getElementById("phone").value.trim();

    const otp =
        document.getElementById("forgotOTP").value.trim();

    if (!phone) {
        showMessage("Please enter phone number.");
        return;
    }

    if (!/^[0-9]{6}$/.test(otp)) {
        showMessage("Please enter valid 6 digit OTP.");
        return;
    }

    try {

        const response = await fetch(
            "/forgot-password/verify-otp/",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCSRFToken()
                },

                credentials: "include",

                body: JSON.stringify({
                    phone: phone,
                    otp: otp
                })
            }
        );

        const data = await response.json();

        console.log("FORGOT OTP RESPONSE:", data);
        console.log("SUCCESS VALUE:", data.success);

        if (data.success === true) {

            showMessage(
                "OTP verified successfully. Redirecting...",
                true
            );

            // DIRECT REDIRECT
            window.location.href = "/login/";

            return;
        }

        showMessage(
            data.message || "Invalid OTP."
        );

    } catch (error) {

        console.error("VERIFY OTP ERROR:", error);

        showMessage(
            "Server error. Please check Django terminal."
        );
    }
};

    // ==========================================
    // RESET PASSWORD
    // ==========================================

    form.addEventListener("submit", async function (e) {

        e.preventDefault();

        const phone =
            document.getElementById("phone").value.trim();

        const newPassword =
            document.getElementById("newPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        if (!phone) {
            showMessage("Please enter phone number.");
            return;
        }

        if (!otpVerified) {
            showMessage("Please verify OTP first.");
            return;
        }

        if (!newPassword || !confirmPassword) {
            showMessage("Please enter both passwords.");
            return;
        }

        if (newPassword.length < 6) {
            showMessage(
                "Password must be at least 6 characters."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage(
                "New password and confirm password do not match."
            );
            return;
        }


        try {

            const response = await fetch(
                "/forgot-password/reset/",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": getCSRFToken()
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        phone: phone,
                        otp: verifiedOTP,
                        new_password: newPassword,
                        confirm_password: confirmPassword
                    })
                }
            );

            const data = await response.json();

            if (data.success) {

                showMessage(
                    "Password reset successfully. Redirecting to login...",
                    true
                );

                setTimeout(function () {
                    window.location.href = "/login/";
                }, 1500);

            } else {

                showMessage(
                    data.message || "Password reset failed."
                );
            }

        } catch (error) {

            console.error("RESET PASSWORD ERROR:", error);

            showMessage(
                "Server error. Please check Django terminal."
            );
        }

    });

});