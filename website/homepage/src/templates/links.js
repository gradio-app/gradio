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


// adds anchor button when hovering over headers, except on touch devices where instead the header becomes a link

function createAnchorTag(link) {
    let a = document.createElement('a');
    a.href = link;
    a.classList.add("invisible", "group-hover-visible");
    let img = document.createElement('img');
    img.classList.add("anchor-img")
    img.src = "/assets/img/anchor.svg";
    a.appendChild(img);
    return a;
}
function createMobileAnchorTag(link) {
    let a = document.createElement('a');
    a.href = link;
    a.classList.add("no-underline")
    return a;
}

var headers = document.querySelectorAll("h2, h3");

function isTouchDevice() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
}

if (isTouchDevice()) {
    for (let i = 0; i < headers.length; i++) {
        let link = '#' + headers[i].id;
        var parent = headers[i].parentNode;
        var wrapper = createMobileAnchorTag(link);
        parent.replaceChild(wrapper, headers[i]);
        wrapper.appendChild(headers[i]);
    }
} else {
    for (let i = 0; i < headers.length; i++) {
        headers[i].classList.add("group")
        let link = '#' + headers[i].id;
        var anchorTag = createAnchorTag(link);
        headers[i].appendChild(createAnchorTag(link));
    }
}

// add copy buttons to all codeblocks

const svgCopy =
    '<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true"><path fill-rule="evenodd" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"></path><path fill-rule="evenodd" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"></path></svg>';
const svgCheck =
    '<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true"><path fill-rule="evenodd" fill="rgb(255, 124, 1)" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path></svg>';


const addCopyButtons = (clipboard) => {
    document.querySelectorAll("pre > code").forEach((codeBlock) => {
        const button = document.createElement("button");
        button.classList.add("clipboard-button");
        button.type = "button";
        button.innerHTML = svgCopy;
        button.addEventListener("click", () => {
            clipboard.writeText(codeBlock.innerText).then(
                () => {
                    button.blur();
                    button.innerHTML = svgCheck;
                    setTimeout(() => (button.innerHTML = svgCopy), 2000);
                },
                (error) => (button.innerHTML = "Error")
            );
        });
        const pre = codeBlock.parentNode;
        pre.parentNode.insertBefore(button, pre);
    });
};

if (navigator && navigator.clipboard) {
    addCopyButtons(navigator.clipboard);
};
