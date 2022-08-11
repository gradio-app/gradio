let mainNavLinks = document.querySelectorAll(".navigation a");
window.addEventListener("scroll", event => {
    let fromTop = window.scrollY;
    let lowest_link = null;
    mainNavLinks.forEach(link => {
        let section = document.querySelector(link.hash);
        if (section.offsetTop <= fromTop * 1.01) {
            lowest_link = link;
        }
        link.classList.remove("current-nav-link");
    });
    lowest_link.classList.add("current-nav-link");
});
