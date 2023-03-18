const progressBar = document.getElementById("progress-bar");
const progressNext = document.getElementById("progress-next");
const progressPrev = document.getElementById("progress-prev");
const steps = document.querySelectorAll(".step")
let active = 1;

progressNext.addEventListener("click", () => {
    active++;
    if(active > steps.length) {
        active = steps.length;
    }
    updateProgress();
});

progressPrev.addEventListener("click", () => {
    active--;
    if(active < 1) {
        active = 1;
    }
    updateProgress();
});

// Adds "active" to steps as it progresses
const updateProgress = () => {
    steps.forEach((step, i) => {
        if(i < active) {
            step.classList.add("active");
        }
        else {
            step.classList.remove("active");
        }
    });
}

// progressBar width
//progressBar.style.width = ( (active - 1)/(steps.length - 1) ) * 100 + "%";

// Button logic
if(active === 1) {
    progressPrev.disabled = true;
}
else if(active === steps.length) {
    progressNext.disabled = true;
}
else {
    progressPrev.disabled = false;
    progressNext.disabled = false;
}



