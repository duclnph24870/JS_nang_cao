export function loading (isLoad,selector) {
    const el = document.querySelector(selector);
    isLoad ? el.innerHTML = '<i class="fa-solid fa-spinner turn"></i>' : '';
}