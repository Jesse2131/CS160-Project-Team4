const userType = localStorage.getItem("userType");

console.log("User type: ", userType);
if (userType === "drivers") {
    if (/customer|restaurant/.test(window.location.pathname.toLocaleLowerCase()) && window.location.pathname.endsWith(".html")) {
        window.history.back();
    }
} else if (userType === "customers") {
    if (/driver|restaurant/.test(window.location.pathname.toLocaleLowerCase()) && window.location.pathname.endsWith(".html")) {
        window.history.back();
    }
} else if (userType === "restaurants") {
    if (/customer|driver/.test(window.location.pathname.toLocaleLowerCase()) && window.location.pathname.endsWith(".html")) {
        window.history.back();
    }
}