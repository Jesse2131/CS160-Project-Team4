const userType = localStorage.getItem("userType");

console.log("User type: ", userType);

if(userType !== null){
    if (userType === "drivers") {
        const allowedPages = ["/", "/accountPage.html", "/cancel_payment.html", "/checkout_detail.html", "/deliveryDashboardDriver.html", "/index.html", 
                                "/inProgressOrder.html", "/login.html", "/signup.html", "/success_payment.html", "/welcomeDashboardDriver.html"];
        const currentPage = window.location.pathname;
        if (!allowedPages.includes(currentPage)) {
            window.addEventListener('beforeunload', function(event) {
                event.preventDefault();
                event.returnValue = ''; // Required for Chrome
            });
            window.location.href = "/noaccess.html"; // Redirect to error page
        }
    } else if (userType === "customers") {
        const allowedPages = ["/", "/accountPage.html", "/cancel_payment.html", "/checkout_detail.html", "/index.html", 
                                "/login.html", "/signup.html", "/success_payment.html", "/customerDash.html", "/customerPage.html"];
        const currentPage = window.location.pathname;
        if (!allowedPages.includes(currentPage)) {
            window.addEventListener('beforeunload', function(event) {
                event.preventDefault();
                event.returnValue = ''; // Required for Chrome
            });
            window.location.href = "/noaccess.html"; // Redirect to error page
        }
    } else if (userType === "restaurants") {
        const allowedPages = ["/", "/accountPage.html", "/cancel_payment.html", "/checkout_detail.html", "/index.html", 
                                "/login.html", "/signup.html", "/success_payment.html", "/restaurantDash.html", "/restaurantPage.html", "/successOrder_page.html"];
        const currentPage = window.location.pathname;
        if (!allowedPages.includes(currentPage)) {
            window.addEventListener('beforeunload', function(event) {
                event.preventDefault();
                event.returnValue = ''; // Required for Chrome
            });
            window.location.href = "/noaccess.html"; // Redirect to error page
        }
    }
}
else{
    const allowedPages = ["/index.html", "/signup.html", "/login.html", "/"];
    const currentPage = window.location.pathname;
    console.log(currentPage);
    if (!allowedPages.includes(currentPage)) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "index.html";
    }
}