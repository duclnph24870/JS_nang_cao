import search from './search.js';
import cart from './cart.js';

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
// lấy ra các element cần thiết
const appEl = $('.app');
// === cart ===
const cartBtn = $('.cart');
const cartModule = $('.cart__modal');

// bật tắt cartModal
const on_off_cartModal = () => {
    cartBtn.onclick = () => {
        cartModule.classList.add('active');
    }

    appEl.onclick = (e) => {
        if (!e.target.closest('.cart') && !e.target.closest('.cart__modal')) {
            cartModule.classList.remove('active');
        }
    }
}

// search 
search.start();

// cart
cart.start();
on_off_cartModal();
