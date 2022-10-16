import search from '../public/search.js';
import { loading } from '../public/loading.js';
import cart from '../public/cart.js';
import showMessage from '../public/showMessage.js';

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const apiCateLink = 'http://localhost:4013/category';
const apiProduct = 'http://localhost:4013/products';

var categoryList;
 
await fetch (apiCateLink)
    .then(res => res.json())
    .then(res => categoryList = res)

const user = {
    start () {
        this.renderMenu();
        $('.navbar').onclick = this.handleClickMenu;
        // add cart
        $('.content-list').onclick = this.handleAddCart;
        // render product mới vào
        loading(true,'.content-list');
        fetch(apiProduct)
            .then(res => res.json())
            .then(res => {
                user.renderProduct(res);
            });
    },
    async selectCate () {
        let cateAll;
        await fetch (apiCateLink)
            .then(res => res.json())
            .then(res => cateAll = res);
        
        return cateAll;
    },
    selectNameStatus (id) {
        let result = undefined;
        switch(id) {
            case'0':
                result = 'NEW';
                break;
            case'1':
                result = 'Truyền Thống';
                break;
            case'2':
                result = 'Phải Thử';
                break;
        }
        return result;
    },

    selectNameCate (id) {
        return categoryList.find(item => item.id == id).name;
    },
    handleAddCart (e) {
        const elClick = e.target;
        if (elClick.closest('.content-btn__addCart')) {
            cart.add(elClick.closest('.content-item').dataset.id);
        }
    },
    handleClickMenu (e) {
        if (e.target.closest('.navbar__item:not(.active)')) {
            const clickEl = e.target;

            $('.navbar__item.active').classList.remove('active');
            e.target.classList.add('active');
            
            loading(true,'.content-list');
            fetch(apiProduct)
                .then(res => res.json())
                .then(res => {
                    let result = search.search('filter',clickEl.dataset.id,res);
                    user.renderProduct(result);
                });
        }
    },
    renderProduct (products) {
        $('.content-list').innerHTML = products.map(item => {
            return `
                <div class="content-item" data-id="${item.id}">
                    <div class="content-item__img">
                        <img src="${item.imgUrl}" alt="">
                    </div>
                    <div class="content-item__title">
                        <span class="content-item__titleText">${item.name}</span>
                        <span class="content-item__titleLabel">${ item.number > 0 ? user.selectNameStatus(item.status) : 'Hết hàng'}</span>
                    </div>
                    <p class="content-item__description">
                        ${item.description}
                    </p>

                    <div class="content-btn__addCart ${item.number == 0 ? 'disabled' : '' }">
                        Chọn
                        <div class="content-btn__addCart-price">${item.price} đ</div>
                    </div>
                </div>
            `;
        }).join('') || '<h1 style="margin:10px 25px; color: #666;">Thể loại không có sản phẩm</h1>';
    },
    renderMenu () {
        loading(true,'.navbar');
        this.selectCate()
            .then(res => {
                $('.navbar').innerHTML = `
                    <div class="navbar__item active" data-id="all">Tất Cả</div>
                ` + res.map((item,index) => {
                    return `
                        <div class="navbar__item" data-id="${item.id}">${item.name}</div>
                    `;
                }).join('');
            })    
    },
}

user.start();