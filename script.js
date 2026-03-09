function login() {

    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
    const alertBox = document.getElementById("loginAlertBox")

    if (username === "admin" && password === "admin123") {

        localStorage.setItem("loggedIn", true)

        window.location.href = "dashboard.html"

    }
    else {
        if(alertBox) {
            alertBox.innerHTML = `
                <div class="alert alert-error text-white font-medium shadow-lg">
                    <span><svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                    <span>Invalid Credentials. Please try again.</span>
                </div>
            `;
            alertBox.classList.remove("hidden");
            setTimeout(() => {
                alertBox.classList.add("hidden");
            }, 3000);
        } else {
            alert("Invalid Credentials");
        }
    }

}