import { loading } from './loading.js';
import showMessage from './showMessage.js';

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

var productList = [];
var cartListArr;
var shipPrice = 0;
var apiLink = 'http://localhost:4013/products';

var cartItemTest = [
    {
        id: 1,
        quantity: 10,
    },
    {
        id: 3,
        quantity: 5,
    },
    {
        id: 5,
        quantity: 2,
    },
    {
        id: 4,
        quantity: 1,
    },
];

// localStorage.setItem('cart',JSON.stringify(cartItemTest));

await fetch (apiLink)
            .then(res => res.json())
            .then(res => {
                return productList = res;
            });

const cart = {
    timeoutCurr: undefined,
    start () {
        this.render();
        this.submit();
    },

    saveCartQuantity (id,number) {
        const cartLocal = JSON.parse(localStorage.getItem('cart'));
        if (cartLocal) {
            let viTri = undefined;
            const itemCart = cartLocal.find((item,index) => {
                if (item.id == id) {
                    viTri = index;
                }
                return item.id == id;
            });

            itemCart.quantity = number;
            
            if (this.timeoutCurr) {
                clearTimeout(this.timeoutCurr);
            }
            this.timeoutCurr = setTimeout(() => {
                this.timeoutCurr = undefined;
                showMessage.render('success','Lưu thay đổi');
                this.selectItemCart()
                    .then(res => {
                        localStorage.setItem('cart',JSON.stringify(cartLocal));
                        // show tổng tiền
                        const sumPrice = this.sumPriceCart(res);
                        $('.sumPrice').innerText = sumPrice + ' đ';
                        $('.btn-price').innerText = sumPrice + shipPrice + ' đ';
                    })
            },1000);
        }
    },

    async selectItemCart () {
        let cartList = JSON.parse(localStorage.getItem('cart')) || [];
        let idCartList = cartList.map(item => +item.id);

        await fetch (apiLink)
        .then(res => res.json())
        .then(res => {
            cartListArr = res.filter(item => idCartList.includes(item.id))
        });

        return cartListArr;
    },

    showNumberCart (products) {
        $('.number-product').innerText = products.length;
    },

    sumPriceCart (products) {
        // lấy ra các element của sản phẩm
        const quantityEls = $$('.cart__content-list .cart__content-item .cart__content-item-amount');

        const sum = products.reduce((total,curr,index) => {
            return total + +curr.price*(+quantityEls[index].value);
        },0)

        return sum;
    },

    async editQuantity () {
        let cartList = JSON.parse(localStorage.getItem('cart')) || [];

        // lấy ra các input có vl = 1 và disabled btn - của nó
        const btnMinEls = $$('.cart__content-item-amount[value="1"]');
        const inputEl = $$('.cart__content-item-amount');

        // disabled các sản phẩm có số lượng là 1
        for (let i = 0;i < btnMinEls.length;i++) {
            btnMinEls[i].previousElementSibling.setAttribute('disabled',true);
        }

        // lấy ra các sản phẩm đang có trong giỏ hàng thời gian thực
        let cartListArr;
        await this.selectItemCart()
                    .then(res => cartListArr = res);
        
        if (cartListArr.length > 0) {
            const currCartEl = $$('.cart__content-item');
            let inputCheckMaxEl = undefined;
            let idPr = undefined;
            // Kiểm tra và disaled các sản phẩm đang có số lượng lớn nhất
            for (let i = 0;i < currCartEl.length;i++) {
                inputCheckMaxEl = currCartEl[i].querySelector('.cart__content-item-amount');
                idPr = currCartEl[i].dataset.id;
                let sumNumber = cartListArr.find(item => +item.id == idPr).number;
                if (sumNumber <= cartList.find(item => item.id == idPr).quantity) {
                    inputCheckMaxEl.value = sumNumber;
                    inputCheckMaxEl.nextElementSibling.setAttribute('disabled',true); 
                }else {
                    inputCheckMaxEl.nextElementSibling.removeAttribute('disabled'); 
                }
            }
    
            // === change input ===
            const handleChangeInput = (e) => {
                const parentInputEl = e.target.closest('.cart__content-item');
                const maxNumber = +cartListArr.find(item => item.id == parentInputEl.dataset.id).number;
                const elValue = +e.target.value;
                const plusEl = e.target.nextElementSibling;
                const minusEl = e.target.previousElementSibling;
                if (elValue >= maxNumber) {
                    e.target.value = maxNumber;
                    plusEl.setAttribute('disabled',true);
                    this.saveCartQuantity(+parentInputEl.dataset.id,+e.target.value);
                }else {
                    plusEl.removeAttribute('disabled');
                    this.saveCartQuantity(+parentInputEl.dataset.id,+e.target.value);
                }
    
                if (elValue <= 1) {
                    e.target.value = 1;
                    minusEl.setAttribute('disabled',true);
                    this.saveCartQuantity(+parentInputEl.dataset.id,+e.target.value);
                }else {
                    minusEl.removeAttribute('disabled');
                    this.saveCartQuantity(+parentInputEl.dataset.id,+e.target.value);
                }            
            }
    
            for (let i = 0; i< inputEl.length;i++) {
                inputEl[i].onchange = handleChangeInput;
            }
    
            // click 
            const handleClick = (e) => {
                const minusEl = e.target.closest('.cart__content-item-minus');
                const plusEl = e.target.closest('.cart__content-item-plus');
                const deleteEl = e.target.closest('.cart__content-item-delete');
                const parentEl = e.target.closest('.cart__content-item');
                let inputEl = undefined;
                if (minusEl) {
                    inputEl = minusEl.nextElementSibling;
                    inputEl.value = +inputEl.value - 1;
                    
                    if (+inputEl.value <= 1) {
                        inputEl.value = 1;
                        minusEl.setAttribute('disabled',true);
                        this.saveCartQuantity(+parentEl.dataset.id,+inputEl.value);
                    }else {
                        minusEl.removeAttribute('disabled');
                        inputEl.nextElementSibling.removeAttribute('disabled');
                        this.saveCartQuantity(+parentEl.dataset.id,+inputEl.value);
                    }
                }else if (plusEl) {
                    inputEl = plusEl.previousElementSibling;
                    let maxNumber = +cartListArr.find(item => item.id == parentEl.dataset.id).number;
                    inputEl.value = +inputEl.value + 1;
    
                    if (+inputEl.value >= maxNumber ) {
                        inputEl.value = maxNumber;
                        plusEl.setAttribute('disabled',true);
                        this.saveCartQuantity(+parentEl.dataset.id,+inputEl.value);
                    }else {
                        plusEl.removeAttribute('disabled');
                        inputEl.previousElementSibling.removeAttribute('disabled');
                        this.saveCartQuantity(+parentEl.dataset.id,+inputEl.value);
                    }
                }else if (deleteEl) {
                    this.delete(parentEl.dataset.id);
                }
            }
    
            $('.cart__content-list').onclick = handleClick;
        }
        
    },

    async render () {
        let cartList = JSON.parse(localStorage.getItem('cart')) || [];
        let idCartList = cartList.map(item => +item.id);

        loading(true,'.cart__content-list');
        await fetch (apiLink)
            .then(res => res.json())
            .then(res => {
                cartListArr = res.filter(item => {
                    return idCartList.includes(item.id);
                })
                this.showNumberCart(cartListArr);

                // hiển thị giao diện cartList
                $('.cart__content-list').innerHTML = cartListArr.map((item,index) => {
                    let quantityItem = cartList.find(prLocal => prLocal.id == item.id).quantity || 0;
                    return `
                        <div class="cart__content-item" data-id="${item.id}">
                            <div class="cart__content-item-avt">
                                <img src="${item.imgUrl}" alt="">
                            </div>
                            <div class="cart__content-item-main">
                                <div class="cart__content-item-name">${item.name}</div>
                                <div class="cart__content-item-price">${item.price} VNĐ</div>
                            </div>

                            <div class="cart__content-item-number">
                                <button class="cart__content-item-btn cart__content-item-minus">-</button>
                                <input type="number" class="cart__content-item-amount" min="1" max="${item.number}" value="${quantityItem < +item.number ? quantityItem : item.number}">
                                <button class="cart__content-item-btn cart__content-item-plus">+</button>
                            </div>

                            <div class="cart__content-item-delete">Xóa</div>
                        </div>
                    `;
                }).join('') || `
                    <div class="cart__content-item noItem">
                        <i class="fa-solid fa-info-circle"></i>
                        Không có sản phẩm trong giỏ hàng
                    </div>
                `;

                // chỉnh sửa số lượng
                this.editQuantity(cartListArr);

                // phí giao hàng
                $('.shipPrice').innerText = shipPrice + ' đ';
                
                // show tổng tiền
                const sumPrice = this.sumPriceCart(cartListArr);
                $('.sumPrice').innerText = sumPrice + ' đ';
                $('.btn-price').innerText = sumPrice + shipPrice + ' đ';
                return res;
            })
    },

    submit () {
        const submitBtn = $('.cart__content-submit');
        
        submitBtn.onclick = this.handleSubmit;
    },

    handleSubmit (e) {
        const cartListEl = $('.cart__content-list');
        const submitBtn = $('.cart__content-submit');

        // thay đổi trạng thái giao diện
        cartListEl.classList.add('submit');
        submitBtn.classList.add('active');
        submitBtn.querySelector('i').classList.add('turn');

        // lấy ra list cart mới nhất
        const cartListLocal = JSON.parse(localStorage.getItem('cart'));
        if (cartListLocal.length > 0) {
            cart.selectItemCart()
                    .then( res => {
                        const fetchAll = [];
                        // Kiểm tra xem số lượng có vượt hạn mức cao nhất chưa
                        res.forEach(async function (item) {
                            let quantityCart = cartListLocal.find(product => product.id == item.id).quantity;

                            if (((item.number - quantityCart) < 0)) {
                                quantityCart = item.number;
                            }

                            let newNumber = item.number - quantityCart;
                            item.number = newNumber;

                            let fetchPromise = fetch (apiLink + '/' + item.id,{
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(item),
                            });
                            fetchAll.push(fetchPromise);
                            console.log(item.id+' đã thanh toán');
                        });

                        Promise.all(fetchAll)
                                .then(res => {
                                    console.log(res);
                                    cartListEl.classList.remove('submit');
                                    submitBtn.classList.remove('active');
                                    submitBtn.querySelector('i').classList.remove('turn');
                                    showMessage.render('success','Thanh toán thành công!');
                                    console.log('Xóa local');
                                    localStorage.setItem('cart',JSON.stringify([]));
                                    cart.render();
                                })
                                .catch (err => {
                                    showMessage.render('err','Thanh toán xảy ra sự cố');
                                });

                        return res;
                    })

        }else {
            showMessage.render('err','Giỏ hàng trống');
            cartListEl.classList.remove('submit');
            submitBtn.classList.remove('active');
            submitBtn.querySelector('i').classList.remove('turn');
        }
    },

    delete (id) {
        let cartList = JSON.parse(localStorage.getItem('cart'));

        if (cartList) {
            let newCartList = cartList.filter(item => item.id != id);
            showMessage.render('success','Xóa sản phẩm thành công!');
            localStorage.setItem('cart',JSON.stringify(newCartList));
            this.render();
        }
    },

    add (id) {
        let cartList = JSON.parse(localStorage.getItem('cart')) || [];

        fetch(apiLink + '/' + id)
            .then(res => res.json())
            .then(res => {

                let check = !cartList.find(item => item.id == id);
        
                if (check && res.number > 0) {
                    let itemAdd = {
                        id: id,
                        quantity: 1,
                    }
            
                    cartList.push(itemAdd);
            
                    localStorage.setItem('cart',JSON.stringify(cartList));
                    this.render();
                    cartList = JSON.parse(localStorage.getItem('cart')) || [];
                    this.showNumberCart(cartList);
                    showMessage.render('success','Thêm sản phẩm thành công');
                }else {
                    showMessage.render('err','Sản phẩm đã tồn tại hoặc đã hết hàng');
                }
            })
        
    }
}

export default cart;