let linksContainer = document.getElementById("navbarSupportedContent");

let links = linksContainer.getElementsByClassName("nav-link");

for (let i = 0; i < links.length - 1; i++) {
    links[i].addEventListener("click", function() {
        let current = document.getElementsByClassName("active");
        current[0].className = current[0].className.replace(" active", "");
        this.className += " active";
    });
}