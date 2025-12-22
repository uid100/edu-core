export function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

export function setHTML(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = value;
}

export function setImage(id, src) {
    const el = document.getElementById(id);
    if (el) el.src = src;
}

export function setLink(id, href) {
    const el = document.getElementById(id);
    if (el) el.href = href;
}
