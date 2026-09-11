
// ==========================================
// SESSION EXPIRED HANDLER
// ==========================================

function redirectToLogin() {

   // console.log("SESSION EXPIRED - REDIRECTING TO LOGIN");

    window.location.href = "/login/";
}





// ==========================================
// CHECK SESSION
// ==========================================

function checkSession() {

    fetch("/profile/", {
        method: "GET",
        credentials: "same-origin"
    })

    .then(response => {

        if (response.status === 401) {

            return fetch("/token/refresh/", {
                method: "POST",
                credentials: "same-origin"
            })

            .then(refreshResponse => {

                if (!refreshResponse.ok) {

                    redirectToLogin();
                    return null;
                }

                return true;
            });
        }

        if (!response.ok) {

            return;
        }

        return true;
    })

    .catch(error => {

        console.error(
            "Session check error:",
            error
        );

    });
}



// ======================================
// LOAD DASHBOARD USER PROFILE
// ======================================

function loadDashboardUser() {

    fetch("/profile/", {

        method: "GET",
        credentials: "same-origin"

    })

    .then(response => {

        // console.log(
        //     "PROFILE STATUS:",
        //     response.status
        // );


        // Access token expired
        if (response.status === 401) {

            return fetch("/token/refresh/", {

                method: "POST",
                credentials: "same-origin"

            })

            .then(refreshResponse => {

                // console.log(
                //     "REFRESH STATUS:",
                //     refreshResponse.status
                // );


                if (!refreshResponse.ok) {

                    throw new Error(
                        "Session expired"
                    );

                }


                // Refresh successful
                // Now profile again

                return fetch("/profile/", {

                    method: "GET",
                    credentials: "same-origin"

                });

            });

        }


        if (!response.ok) {

            throw new Error(
                "Profile request failed: " +
                response.status
            );

        }


        return response;

    })


    .then(response => response.json())


    .then(data => {

        // console.log(
        //     "PROFILE DATA:",
        //     data
        // );


        if (!data.success) {

            // console.error(
            //     data.message
            // );

            return;

        }


        // ==================================
        // NAME
        // ==================================

        const profileName =
            document.getElementById(
                "profileName"
            );

        if (profileName) {

            profileName.innerText =
                data.name;

        }


        // ==================================
        // EMAIL
        // ==================================

        const profileEmail =
            document.getElementById(
                "profileEmail"
            );

        if (profileEmail) {

            profileEmail.innerText =
                data.email;

        }


        // ==================================
        // PHONE
        // ==================================

        const profilePhone =
            document.getElementById(
                "profilePhone"
            );

        if (profilePhone) {

            profilePhone.innerText =
                "+91 " + data.phone;

        }


        // ==================================
        // PROFILE PHOTO
        // ==================================

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


        // ==================================
        // WELCOME NAME
        // ==================================

        const dashboardName =
            document.getElementById(
                "dashboardName"
            );

        if (dashboardName) {

            dashboardName.innerText =
                "Welcome , " +
                data.name +
                " 👋";

        }




        // ==================================
// TOPBAR USER NAME
// ==================================

const topUserName = document.getElementById("topUserName");

if (topUserName) {

    topUserName.innerText =
        data.name;

}

// ==================================
// TOPBAR DP INITIALS
// ==================================

const topUserAvatar = document.getElementById("topUserAvatar");

if (topUserAvatar && data.name) {

    const nameParts = data.name.trim().split(/\s+/);

    let initials = "";

    if (nameParts.length >= 2) {

        initials = nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0);

    } else {

        initials =  nameParts[0].substring(0, 2);

    }

    topUserAvatar.innerText = initials.toUpperCase();

}

    })

    .catch(error => {

        console.error( "Dashboard profile error:", error );

    });

}


function loadDashboardOrders() {

    fetch("/orders/", {
        method: "GET",
        credentials: "same-origin"
    })

    .then(response => {

        //console.log("ORDERS STATUS:", response.status);

        // Access token expired
        if (response.status === 401) {

            return fetch("/token/refresh/", {
                method: "POST",
                credentials: "same-origin"
            })

            .then(refreshResponse => {

                console.log("ORDER REFRESH STATUS:", refreshResponse.status );

                if (!refreshResponse.ok) {
                    throw new Error("Session expired");
                }

                return fetch("/orders/", {
                    method: "GET",
                    credentials: "same-origin"
                });

            });
        }

        if (!response.ok) {

            throw new Error("Orders request failed: " + response.status );

        }

        return response;

    })

    .then(response => response.json())

    .then(data => {

        // console.log("DASHBOARD ORDERS:", data);

        if (!data.success) {

            console.error(data.message);

            return;

        }


        // ==================================
        // DASHBOARD STAT CARDS
        // ==================================

        let totalOrders =  data.orders.length;

        let totalSpent = 0;

        let pendingOrders = 0;


        data.orders.forEach(order => {

            // Total Spent
            totalSpent += parseFloat( order.total_amount || 0  );


            // Pending Orders
            if (
                order.status === "pending" || order.status === "confirmed"
            ) {

                pendingOrders++;

            }

        });


        // ==================================
        // TOTAL ORDERS
        // ==================================

        const totalOrdersCount = document.getElementById("totalOrdersCount" );

        if (totalOrdersCount) {

            totalOrdersCount.innerText = totalOrders;

        }


        // ==================================
        // TOTAL SPENT
        // ==================================

        const totalSpentAmount =
            document.getElementById("totalSpentAmount" );

        if (totalSpentAmount) {

            totalSpentAmount.innerText ="₹" + totalSpent.toLocaleString("en-IN");

        }


        // ==================================
        // PENDING ORDERS
        // ==================================

        const pendingOrdersCount =
            document.getElementById("pendingOrdersCount");

        if (pendingOrdersCount) {

            pendingOrdersCount.innerText = String(  pendingOrders ).padStart(2, "0");

        }


        // ==================================
        // ORDER STATUS COUNT
        // ==================================

        let delivered = 0;
        let shipped = 0;
        let processing = 0;
        let cancelled = 0;


        data.orders.forEach(order => {

            if (
                order.status === "delivered"
            ) {

                delivered++;

            }

            else if (
                order.status === "shipped" || order.status === "out_for_delivery"
            ) {

                shipped++;

            }

            else if (
                order.status === "pending" ||  order.status === "confirmed"
            ) {

                processing++;

            }

            else if (
                order.status === "cancelled"
            ) {

                cancelled++;

            }

        });


        // ==================================
        // UPDATE ORDER STATUS
        // ==================================

        const deliveredCount =
            document.getElementById(
                "deliveredCount"
            );

        const shippedCount =
            document.getElementById(
                "shippedCount"
            );

        const processingCount =
            document.getElementById(
                "processingCount"
            );

        const cancelledCount =
            document.getElementById(
                "cancelledCount"
            );


        if (deliveredCount) {

            deliveredCount.innerText =
                delivered;

        }


        if (shippedCount) {

            shippedCount.innerText =
                shipped;

        }


        if (processingCount) {

            processingCount.innerText =
                processing;

        }


        if (cancelledCount) {

            cancelledCount.innerText =
                cancelled;

        }


        // ==================================
        // RECENT ORDERS
        // ==================================

        const recentContainer =
            document.getElementById(
                "recentOrdersContainer"
            );


        if (!recentContainer) {

            return;

        }


        if (
            !data.orders ||
            data.orders.length === 0
        ) {

            recentContainer.innerHTML = `
                <p style="
                    color:#777;
                    text-align:center;
                    padding:15px 0;
                ">
                    No orders yet.
                </p>
            `;

            return;

        }


        // Latest 3 orders

        const recentOrders =
            data.orders.slice(0, 3);


        let recentHtml = "";


        recentOrders.forEach(order => {

            let productName = "Order";

            let productPrice =
                order.total_amount;


            // ==================================
            // DEFAULT IMAGE
            // ==================================

            let imageHtml = `
                <div style="
                    width:55px;
                    height:55px;
                    min-width:55px;
                    max-width:55px;
                    flex:0 0 55px;
                    border-radius:8px;
                    overflow:hidden;
                    background:#f7f7fa;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    box-sizing:border-box;
                ">
                    📦
                </div>
            `;


            // ==================================
            // FIRST PRODUCT
            // ==================================

            if (
                order.items &&
                order.items.length > 0
            ) {

                const item =
                    order.items[0];


                productName =
                    item.name;


                productPrice =
                    item.price;


                if (item.image) {

                    imageHtml = `
                        <div style="
                            width:55px;
                            height:55px;
                            min-width:55px;
                            max-width:55px;
                            flex:0 0 55px;
                            border-radius:8px;
                            overflow:hidden;
                            background:#f7f7fa;
                            box-sizing:border-box;
                        ">

                            <img
                                src="${item.image}"
                                alt="${item.name}"
                                style="
                                    width:55px !important;
                                    height:55px !important;
                                    min-width:55px !important;
                                    max-width:55px !important;
                                    min-height:55px !important;
                                    max-height:55px !important;
                                    object-fit:cover !important;
                                    display:block !important;
                                "
                            >

                        </div>
                    `;

                }

            }


            // ==================================
            // STATUS TEXT
            // ==================================

            const statusText =
                order.status
                    .replaceAll("_", " ")
                    .replace(/\b\w/g, c =>
                        c.toUpperCase()
                    );


            // ==================================
            // STATUS CLASS
            // ==================================

            let statusClass =
                "processing";


            if (
                order.status === "delivered"
            ) {

                statusClass =
                    "delivered";

            }

            else if (
                order.status === "shipped" ||
                order.status === "out_for_delivery"
            ) {

                statusClass =
                    "shipped";

            }

            else if (
                order.status === "cancelled"
            ) {

                statusClass =
                    "cancelled";

            }


            // ==================================
            // ORDER HTML
            // ==================================

            recentHtml += `
                <div
                    class="recent-order"
                    onclick="
                        window.location.href=
                        '/dashboard/order/'
                    "
                    style="
                        cursor:pointer;
                        display:flex;
                        align-items:center;
                        position:relative;
                        width:100%;
                        height:75px;
                        min-height:75px;
                        margin:0;
                        padding:8px 0;
                        box-sizing:border-box;
                        overflow:hidden;
                        border-bottom:1px solid #eee;
                    "
                >

                    ${imageHtml}


                    <div style="
                        flex:1;
                        min-width:0;
                        margin-left:10px;
                        padding-right:65px;
                        overflow:hidden;
                    ">

                        <h3 style="
                            margin:0 0 3px;
                            font-size:11px;
                            line-height:15px;
                            white-space:nowrap;
                            overflow:hidden;
                            text-overflow:ellipsis;
                        ">
                            ${productName}
                        </h3>


                        <strong style="
                            font-size:11px;
                        ">
                            ₹${productPrice}
                        </strong>


                        <p style="
                            margin:3px 0 0;
                            color:#888;
                            font-size:9px;
                        ">
                            ${statusText}
                        </p>

                    </div>


                    <span
                        class="${statusClass}"
                        style="
                            position:absolute;
                            right:0;
                            top:10px;
                            padding:4px 7px;
                            border-radius:10px;
                            font-size:8px;
                            white-space:nowrap;
                            background:#e5f8ed;
                            color:#2ca761;
                        "
                    >
                        ${statusText}
                    </span>

                </div>
            `;

        });


        recentContainer.innerHTML =
            recentHtml;

    })


    .catch(error => {

        console.error(
            "Dashboard orders error:",
            error
        );

    });

}


// ======================================
// LOGOUT
// ======================================

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            const csrfElement =
                document.querySelector(
                    '[name=csrfmiddlewaretoken]'
                );

            if (!csrfElement) {

                console.error(
                    "CSRF token not found"
                );

                return;
            }

            fetch("/logout/", {

                method: "POST",

                credentials: "same-origin",

                headers: {
                    "X-CSRFToken":
                        csrfElement.value
                }

            })

            .then(response => {

                if (!response.ok) {

                    throw new Error(
                        "Logout failed: " +
                        response.status
                    );

                }

                return response.json();

            })

            .then(data => {

                console.log(
                    "LOGOUT RESPONSE:",
                    data
                );

                window.location.href =
                    "/phone/";

            })

            .catch(error => {

                console.error(
                    "Logout error:",
                    error
                );

            });

        }
    );

}


// ======================================
// PAGE LOAD
// ======================================

checkSession();

loadDashboardUser();
loadDashboardOrders();

const editProfileBtn = document.getElementById("editProfileBtn");

if (editProfileBtn) {

    editProfileBtn.addEventListener("click", function () {

        window.location.href = "/edit-profile/";

    });

}




function loadProducts(category = null, search = null) {

    let url = "/products/";

    const params = new URLSearchParams();

    // Category
    if (category) {
        params.append(
            "category",
            category
        );
    }

    // Search
    if (search) {
        params.append(
            "search",
            search
        );
    }

    // Add query string
    if (params.toString()) {
        url += "?" + params.toString();
    }


    fetch(url, {
        method: "GET",
        credentials: "same-origin"
    })

    .then(response => {

        if (!response.ok) {

            throw new Error(
                "Products request failed: " +
                response.status
            );

        }

        return response.json();

    })

    .then(data => {

        // console.log( "PRODUCT DATA:",data );


        const container =
            document.getElementById(
                "productsContainer"
            );


        if (!container) {
            return;
        }


        if (
            !data.success ||
            !data.products ||
            data.products.length === 0
        ) {

            container.innerHTML = `
                <p style="
                    padding:30px;
                    text-align:center;
                    color:#777;
                ">
                    No products found.
                </p>
            `;

            return;

        }


        // ======================================
        // RANDOM PRODUCTS
        // ======================================

        //  normal dashboard  random
        // Search/category  random 

        if (!category && !search) {

            data.products.sort(
                () => Math.random() - 0.5
            );

        }


        container.innerHTML = "";


        // ======================================
        // SHOW PRODUCTS
        // ======================================

        data.products.forEach(product => {

            const productDiv =
                document.createElement("div");

            productDiv.className =
                "product";


            // ======================================
            // PRODUCT IMAGE
            // ======================================

            let imageHTML = "";


            if (product.image) {

                imageHTML = `
                    <img
                        src="${product.image}"
                        alt="${product.name}"
                        style="
                            width:100%;
                            height:180px;
                            object-fit:contain;
                            display:block;
                        "
                    >
                `;

            }

            else {

                imageHTML = `
                    <div class="product-image">
                        🛍️
                    </div>
                `;

            }


            // ======================================
            // PRODUCT HTML
            // ======================================

            productDiv.innerHTML = `

                <button class="heart">
                    ♡
                </button>

                <div class="product-image">
                    ${imageHTML}
                </div>

                <h3>
                    ${product.name}
                </h3>

                <strong>
                    ₹${product.price}
                </strong>

                <p class="rating">
                    ⭐ 4.5
                    <span>(0)</span>
                </p>

                <button
                    class="cart-btn"
                    data-product-id="${product.id}">
                    Add to Cart
                </button>

            `;


            container.appendChild(
                productDiv
            );
            productDiv.style.cursor = "pointer";

productDiv.addEventListener("click", function (event) {

    if (
        event.target.closest(".cart-btn") ||
        event.target.closest(".heart")
    ) {
        return;
    }

    window.location.href =
        `/product/${product.id}/`;
});


 // ======================================
// WISHLIST
// ======================================

const heartButton =
    productDiv.querySelector(".heart");

heartButton.addEventListener(
    "click",
    function () {

        const csrfElement =
            document.querySelector(
                '[name=csrfmiddlewaretoken]'
            );

        if (!csrfElement) {
            //console.error("CSRF token not found");
            return;
        }

        fetch("/wishlist-toggle/", {

            method: "POST",

            credentials: "same-origin",

            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfElement.value
            },

            body: JSON.stringify({
                product_id: product.id
            })

        })

        .then(response => {

            if (response.status === 401) {
                throw new Error("Please login again.");
            }

            return response.json();

        })

        .then(data => {

            console.log(
                "WISHLIST RESPONSE:",
                data
            );

            if (data.success) {

                if (data.wishlisted) {
                    this.innerText = "♥";
                } else {
                    this.innerText = "♡";
                }

                loadWishlistCount();

            } else {

                alert(data.message);

            }

        })

        .catch(error => {

            console.error(
                "Wishlist error:",
                error
            );

        });

    }
);

          // ======================================
            // ADD TO CART
            // ======================================

            const cartButton =
                productDiv.querySelector(
                    ".cart-btn"
                );


            cartButton.addEventListener(
                "click",
                function () {

                    const productId =
                        this.getAttribute(
                            "data-product-id"
                        );


                    const csrfElement =
                        document.querySelector(
                            '[name=csrfmiddlewaretoken]'
                        );


                    if (!csrfElement) {

                        console.error(
                            "CSRF token not found"
                        );

                        return;

                    }


                    fetch(
                        "/add-to-cart/",
                        {

                            method: "POST",

                            credentials:
                                "same-origin",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "X-CSRFToken":
                                    csrfElement.value

                            },

                            body:
                                JSON.stringify({

                                    product_id:
                                        productId

                                })

                        }
                    )

                    .then(response => {

                        if (
                            response.status === 401
                        ) {

                            throw new Error(
                                "Please login again."
                            );

                        }

                        return response.json();

                    })

                    .then(data => {

                        console.log(
                            "CART RESPONSE:",
                            data
                        );


                        if (data.success) {

                            this.innerText =
                                "Added ✓";

                            loadCartCount();

                        }

                        else {

                            alert(
                                data.message
                            );

                        }

                    })

                    .catch(error => {

                        console.error(
                            "Cart error:",
                            error
                        );

                    });

                }
            );

        });

    })

    .catch(error => {

        console.error(
            "Products error:",
            error
        );

    });

}



//serachar bar top ka 

// ======================================
// PRODUCT SEARCH
// ======================================

const searchInput =
    document.getElementById("searchInput");

const searchBtn =
    document.getElementById("searchBtn");


// Search button
if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        function () {

            const searchText =
                searchInput.value.trim();

            loadProducts(
                null,
                searchText
            );

        }
    );

}


// Enter key
if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                const searchText =
                    searchInput.value.trim();

                loadProducts(
                    null,
                    searchText
                );

            }

        }
    );

}


// ======================================
// CATEGORY CLICK
// ======================================

document.addEventListener(
    "click",
    function (event) {

        const category =
            event.target.closest(".category");

        if (!category) {
            return;
        }


        const categoryName =
            category.getAttribute(
                "data-category"
            );


        console.log(
            "CATEGORY CLICK:",
            categoryName
        );


        if (!categoryName) {
            return;
        }


        loadProducts(categoryName);

    }
);


// ======================================
// LOAD RANDOM PRODUCTS ON PAGE LOAD
// ======================================
// document.addEventListener("click", function (event) {
//     console.log("CLICK:", event.target);

//     const category = event.target.closest(".category");

//     if (category) {
//         console.log("CATEGORY MIL GAYI:", category);
//     }
// });




function loadCartCount() {

    fetch("/cart-count/", {
        method: "GET",
        credentials: "same-origin"
    })
    .then(response => response.json())
    .then(data => {

        // console.log("CART COUNT:", data);

        const cartCount =
            document.getElementById("cartCount");

        if (!cartCount) return;

        if (data.success) {
            cartCount.innerText = data.count;
        }

    })
    .catch(error => {
        console.error("Cart count error:", error);
    });
}


function loadCart() {

    const container = document.getElementById("cartContainer");

    if (!container) return;

    fetch("/cart/", {
        method: "GET",
        credentials: "same-origin"
    })
    .then(response => {

        if (!response.ok) {
            throw new Error("Cart request failed: " + response.status);
        }

        return response.json();
    })
    .then(data => {

        console.log("CART DATA:", data);

        if (!data.success || !data.items || data.items.length === 0) {

            container.innerHTML = `
                <div style="
                    text-align:center;
                    padding:60px 20px;
                ">
                    <div style="font-size:50px;">🛒</div>

                    <h3>Your cart is empty</h3>

                    <p>Add some products to your cart.</p>
                </div>
            `;

            return;
        }

        let html = "";

        data.items.forEach(item => {

            let imageHTML = "";

            if (item.image) {

                imageHTML = `
                    <img
                        src="${item.image}"
                        alt="${item.name}"
                        style="
                            width:110px;
                            height:110px;
                            object-fit:contain;
                            border-radius:8px;
                            display:block;
                        "
                    >
                `;

            } else {

                imageHTML = `
                    <div style="
                        width:110px;
                        height:110px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        font-size:40px;
                        background:#f5f5f5;
                        border-radius:8px;
                    ">
                        🛍️
                    </div>
                `;
            }


            html += `

                <div
                    class="cart-item"
                    style="
                        display:flex;
                        align-items:center;
                        gap:25px;
                        padding:25px 0;
                        border-bottom:1px solid #e5e5e5;
                    "
                >

                    <!-- PRODUCT IMAGE -->

                    <div style="
                        width:110px;
                        flex-shrink:0;
                    ">
                        ${imageHTML}
                    </div>


                    <!-- PRODUCT DETAILS -->

                    <div style="
                        flex:1;
                        min-width:150px;
                    ">

                        <h3 style="
                            margin:0 0 10px;
                            font-size:22px;
                        ">
                            ${item.name}
                        </h3>

                        <p style="
                            margin:0;
                            font-size:17px;
                        ">
                            ₹${item.price}
                        </p>

                    </div>


                    <!-- QUANTITY -->

                    <div style="
                        display:flex;
                        align-items:center;
                        gap:12px;
                    ">

                        <button
                            onclick="decreaseQuantity(
                                ${item.id},
                                ${item.quantity}
                            )"
                            style="
                                width:40px;
                                height:40px;
                                border:1px solid #bbb;
                                background:white;
                                border-radius:4px;
                                font-size:20px;
                                cursor:pointer;
                            "
                        >
                            −
                        </button>


                        <strong style="
                            min-width:20px;
                            text-align:center;
                            font-size:18px;
                        ">
                            ${item.quantity}
                        </strong>


                        <button
                            onclick="increaseQuantity(
                                ${item.id},
                                ${item.quantity}
                            )"
                            style="
                                width:40px;
                                height:40px;
                                border:1px solid #bbb;
                                background:white;
                                border-radius:4px;
                                font-size:20px;
                                cursor:pointer;
                            "
                        >
                            +
                        </button>

                    </div>


                    <!-- ITEM TOTAL -->

                    <div style="
                        width:150px;
                        font-weight:bold;
                        font-size:18px;
                    ">
                        ₹${item.total}
                    </div>


                    <!-- DELETE -->

                    <button
                        onclick="removeCartItem(${item.id})"
                        title="Remove item"
                        style="
                            border:none;
                            background:none;
                            color:#e53935;
                            cursor:pointer;
                            font-size:25px;
                        "
                    >
                        🗑️
                    </button>

                </div>
            `;
        });


        /* =========================
           TOTAL + PAYMENT BUTTON
        ========================= */

        html += `

            <div style="
                padding-top:25px;
            ">

                <!-- GRAND TOTAL -->

                <div style="
                    display:flex;
                    justify-content:flex-end;
                    align-items:center;
                    font-size:23px;
                    margin-bottom:25px;
                ">

                    <strong>
                        Grand Total:
                    </strong>

                    <strong style="
                        margin-left:10px;
                        color:#16852a;
                    ">
                        ₹${data.total}
                    </strong>

                </div>


                <!-- BUTTONS -->

                <div style="
                    display:flex;
                    justify-content:flex-end;
                    gap:15px;
                ">

                    <button
                        onclick="window.location.href='/dashboard/'"
                        style="
                            padding:14px 28px;
                            background:white;
                            border:1px solid #bbb;
                            border-radius:7px;
                            font-size:16px;
                            cursor:pointer;
                        "
                    >
                        🛒 &nbsp; Continue Shopping
                    </button>


                    <button
                        onclick="window.location.href='/dashboard/pay/'"
                        style="
                            padding:14px 35px;
                            background:#08a52b;
                            color:white;
                            border:none;
                            border-radius:7px;
                            font-size:16px;
                            font-weight:600;
                            cursor:pointer;
                        "
                    >
                        🔒 &nbsp; Proceed to Payment
                    </button>

                </div>

            </div>
        `;


        container.innerHTML = html;

    })
    .catch(error => {

        console.error("Cart error:", error);

        container.innerHTML = `
            <p>Unable to load cart.</p>
        `;
    });
}

/* ============================= */
/* UPDATE CART QUANTITY */
/* ============================= */

function updateCartItem(cartId, newQuantity) {

    if (newQuantity < 1) {
        return;
    }

    const csrfElement =
        document.querySelector('[name=csrfmiddlewaretoken]');

    if (!csrfElement) {
        console.error("CSRF token not found");
        return;
    }

    fetch("/update-cart-quantity/", {

        method: "POST",

        credentials: "same-origin",

        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfElement.value
        },

        body: JSON.stringify({
            cart_id: cartId,
            quantity: newQuantity
        })
    })
    .then(response => response.json())
    .then(data => {

        console.log("UPDATE CART:", data);

        if (data.success) {

            loadCart();

            loadCartCount();

        } else {

            alert(data.message);
        }

    })
    .catch(error => {

        console.error("Update cart error:", error);

    });
}


/* ============================= */
/* PLUS */
/* ============================= */

function increaseQuantity(cartId, quantity) {

    updateCartItem(
        cartId,
        quantity + 1
    );
}


/* ============================= */
/* MINUS */
/* ============================= */

function decreaseQuantity(cartId, quantity) {

    if (quantity <= 1) {
        return;
    }

    updateCartItem(
        cartId,
        quantity - 1
    );
}


/* ============================= */
/* REMOVE ITEM */
/* ============================= */

function removeCartItem(cartId) {

    if (!confirm("Remove this item from cart?")) {
        return;
    }

    const csrfElement =
        document.querySelector('[name=csrfmiddlewaretoken]');

    if (!csrfElement) {
        console.error("CSRF token not found");
        return;
    }

    fetch(`/remove-cart-item/${cartId}/`, {

        method: "DELETE",

        credentials: "same-origin",

        headers: {
            "X-CSRFToken": csrfElement.value
        }

    })
    .then(response => response.json())
    .then(data => {

        console.log("REMOVE CART:", data);

        if (data.success) {

            loadCart();

            loadCartCount();

        } else {

            alert(data.message);
        }

    })
    .catch(error => {

        console.error("Remove cart error:", error);

    });
}





// ======================================
// LOAD WISHLIST COUNT
// ======================================

function loadWishlistCount() {

    fetch("/wishlist-count/", {
        method: "GET",
        credentials: "same-origin"
    })

    .then(response => {

        if (!response.ok) {
            throw new Error(
                "Wishlist count failed: " +
                response.status
            );
        }

        return response.json();

    })

    .then(data => {

        // console.log(
        //     "WISHLIST COUNT:",
        //     data
        // );

        const wishlistCount =
            document.getElementById("wishlistCount");

        if (!wishlistCount) {
            return;
        }

        if (data.success) {
            wishlistCount.innerText =
                data.count;
        }

    })

    .catch(error => {

        console.error(
            "Wishlist count error:",
            error
        );

    });
}

// ======================================
// LOAD NOTIFICATION COUNT
// ======================================

function loadNotificationCount() {

    fetch("/notification-count/", {
        method: "GET",
        credentials: "same-origin"
    })

    .then(response => {

        if (!response.ok) {
            throw new Error(
                "Notification count failed: " +
                response.status
            );
        }

        return response.json();

    })

    .then(data => {

        // console.log( "NOTIFICATION COUNT:", data );

        const notificationCount =
            document.getElementById(
                "notificationCount"
            );

        if (!notificationCount) {
            return;
        }

        if (data.success) {
            notificationCount.innerText =
                data.count;
        }

    })

    .catch(error => {

        console.error(
            "Notification count error:",
            error
        );

    });
}


// ======================================
// NOTIFICATION ICON CLICK
// ======================================

const notificationIcon =
    document.getElementById("notificationIcon");

if (notificationIcon) {

    notificationIcon.addEventListener(
        "click",
        function () {

            window.location.href =
                "/dashboard/notification/";

        }
    );

}

document.addEventListener("DOMContentLoaded", function () {

    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (!menuBtn || !sidebar) return;

    menuBtn.addEventListener("click", function () {
        sidebar.classList.toggle("sidebar-hidden");

        document.body.classList.toggle(
            "sidebar-open",
            !sidebar.classList.contains("sidebar-hidden")
        );
    });

    if (overlay) {
        overlay.addEventListener("click", function () {
            sidebar.classList.add("sidebar-hidden");
            document.body.classList.remove("sidebar-open");
        });
    }

});


loadProducts();
loadCartCount();
loadWishlistCount();
loadNotificationCount();
loadCart();

// ==========================================
// SESSION CHECK EVERY 1 MINUTE
// ==========================================

setInterval(() => {

    checkSession();

}, 60000);