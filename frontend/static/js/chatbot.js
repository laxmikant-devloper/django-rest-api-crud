document.addEventListener("DOMContentLoaded", function () {

    const chatBtn = document.getElementById("skChatBtn");
    const chatBox = document.getElementById("skChatBox");
    const chatClose = document.getElementById("skChatClose");

    const chatInput = document.getElementById("skChatInput");
    const chatSend = document.getElementById("skChatSend");
    const chatMessages = document.getElementById("skChatMessages");

    if (!chatBtn || !chatBox || !chatInput || !chatSend) {
        return;
    }


    // Open chatbot
    chatBtn.addEventListener("click", function () {
        chatBox.classList.add("active");
        chatInput.focus();
    });


    // Close chatbot
    if (chatClose) {
        chatClose.addEventListener("click", function () {
            chatBox.classList.remove("active");
        });
    }


    // Send message
    async function sendMessage(message = null) {

        const text = message || chatInput.value.trim();

        if (!text) {
            return;
        }


        // User message
        addMessage(text, "user");


        if (!message) {
            chatInput.value = "";
        }


        // Typing indicator
        const typing = document.createElement("div");

        typing.className = "sk-bot-message sk-typing";
        typing.innerHTML = "🤖 Thinking...";

        chatMessages.appendChild(typing);

        scrollChat();


        try {

            const response = await fetch("/chatbot/", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCSRFToken()
                },

                credentials: "include",

                body: JSON.stringify({
                    message: text
                })

            });


            const data = await response.json();


            typing.remove();


            if (data.success) {

                addMessage(data.reply, "bot");

            } else {

                addMessage(
                    "⚠️ " + (data.message || "Something went wrong."),
                    "bot"
                );

            }

        } catch (error) {

            console.error("Chatbot error:", error);

            typing.remove();

            addMessage(
                "⚠️ Chatbot se connection nahi ho pa raha.",
                "bot"
            );
        }

    }


    // Add message
    function addMessage(text, type) {

        const messageDiv = document.createElement("div");

        if (type === "user") {
            messageDiv.className = "sk-user-message";
        } else {
            messageDiv.className = "sk-bot-message";
        }


        // New lines
        messageDiv.innerHTML = escapeHTML(text)
            .replace(/\n/g, "<br>");


        chatMessages.appendChild(messageDiv);

        scrollChat();
    }


    // Prevent HTML injection
    function escapeHTML(text) {

        const div = document.createElement("div");

        div.textContent = text;

        return div.innerHTML;
    }


    // Enter key
    chatInput.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            sendMessage();
        }

    });


    // Send button
    chatSend.addEventListener("click", function () {

        sendMessage();

    });


    // Quick buttons
    document.querySelectorAll(".sk-quick-btn").forEach(function (button) {

        button.addEventListener("click", function () {

            const question = this.dataset.question;

            if (question) {
                sendMessage(question);
            }

        });

    });


    // Scroll
    function scrollChat() {

        chatMessages.scrollTop =
            chatMessages.scrollHeight;

    }


    // CSRF token
    function getCSRFToken() {

        const name = "csrftoken=";

        const cookies = document.cookie.split(";");

        for (let cookie of cookies) {

            cookie = cookie.trim();

            if (cookie.startsWith(name)) {

                return decodeURIComponent(
                    cookie.substring(name.length)
                );

            }

        }

        return "";
    }

});