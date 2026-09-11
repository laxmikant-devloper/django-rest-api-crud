let captcha = "";


/* =========================================
   GENERATE CAPTCHA
========================================= */

function generateCaptcha() {

    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    captcha = "";

    for (let i = 0; i < 6; i++) {

        captcha += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );

    }

    document.getElementById("captchaCode").innerText = captcha;
}


/* =========================================
   REFRESH CAPTCHA
========================================= */

function refreshCaptcha() {

    generateCaptcha();

    document.getElementById("captcha").value = "";
}


/* =========================================
   SEND DATA
========================================= */

function sendData() {

    const phone =
        document.getElementById("phone").value.trim();

    const enteredCaptcha =
        document.getElementById("captcha").value.trim();


    /* =====================================
       PHONE VALIDATION
    ===================================== */

    if (phone === "") {

        alert("Please enter phone number");
        return;
    }


    if (!/^\d{10}$/.test(phone)) {

        alert("Please enter a valid 10 digit phone number");
        return;
    }


    /* =====================================
       CAPTCHA VALIDATION
    ===================================== */

    if (enteredCaptcha === "") {

        alert("Please enter captcha");
        return;
    }


    if (enteredCaptcha !== captcha) {

        alert("Invalid Captcha");

        generateCaptcha();

        document.getElementById("captcha").value = "";

        return;
    }


    /* =====================================
       CSRF TOKEN
    ===================================== */

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


    /* =====================================
       FORM DATA
    ===================================== */

    const formData =
        new URLSearchParams();


    formData.append(
        "phone",
        phone
    );


    /* =====================================
       SEND TO DJANGO
    ===================================== */

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

        console.log(data);


        if (data.success) {

            /* ==============================
               SAVE PHONE
            ============================== */

            sessionStorage.setItem(
                "phone",
                phone
            );


            /* ==============================
               OPEN OTP PAGE
            ============================== */

            window.location.href =
                "/otp/";

        }

        else {

            alert(
                data.message ||
                "Something went wrong"
            );

        }

    })

    .catch(error => {

        console.error(
            "Error:",
            error
        );

        alert(
            "Unable to send request. Please try again."
        );

    });

}


/* =========================================
   PAGE LOAD
========================================= */

window.onload = function () {

    generateCaptcha();

};