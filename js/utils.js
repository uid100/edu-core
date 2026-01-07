export function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}


export function setTextAll(selector, text) {
  document.querySelectorAll(selector).forEach(el => {
    el.textContent = text ?? '';
  });
}