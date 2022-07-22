const COLOR_SETS = [
    ["from-green-100", "to-green-50"],
    ["from-yellow-100", "to-yellow-50"],
    ["from-red-100", "to-red-50"],
    ["from-blue-100", "to-blue-50"],
    ["from-pink-100", "to-pink-50"],
    ["from-purple-100", "to-purple-50"],
]
document.querySelectorAll(".guide-box").forEach(guide => {
    const [start_color, end_color] = COLOR_SETS[Math.floor(Math.random() * COLOR_SETS.length)]
    guide.classList.add(start_color);
    guide.classList.add(end_color);
})
