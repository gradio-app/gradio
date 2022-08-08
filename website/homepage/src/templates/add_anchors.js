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
