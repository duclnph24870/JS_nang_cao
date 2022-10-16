import { loading } from "../public/loading.js";
import showMessage from "../public/showMessage.js";
import nextPage from "./nextPage.js";
import validate from './validate.js';

const $ = document.querySelector.bind(document);

const apiCateLink = 'http://localhost:4013/category';
const apiProLink = 'http://localhost:4013/products';
const urlDefault = 'https://branditechture.agency/brand-logos/wp-content/uploads/2022/06/pizza-hut.png';

var categoryList;
 
await fetch (apiCateLink)
    .then(res => res.json())
    .then(res => categoryList = res);

const admin = {
    start () {
        this.renderCate();
        this.renderTable();
        $('.tableList tbody').onclick = (e) => {
            const clickEl = e.target;
            const parentEl = clickEl.closest('tr');

            if (clickEl.closest('.delete')) {
                loading(true,'.'+clickEl.classList[1]);
                admin.handleDelete(parentEl.dataset.id,'.'+clickEl.classList[1]);
            } else if (clickEl.closest('.edit')) {
                nextPage.nextPage(undefined,clickEl.closest('.edit'),1)
                admin.handleEdit(parentEl.dataset.id);
            }
        }
    },

    handleEdit (id) {
        const selectorInput = {
            name: '.input-block__input.name',
            number:'.input-block__input.number',
            price:'.input-block__input.price',
            category:'.input-block__input.category',
            description:'.input-block__input.description',
            img:'.image-img',
            status:'.input-block.radio',
        };

        fetch (apiProLink + '/' + id)
            .then(res => res.json())
            .then(res => {
                let buttonSubmit = $('.admin-from button[type="submit"]');
                $(selectorInput.name).value = res.name;
                $(selectorInput.number).value = res.number;
                $(selectorInput.price).value = res.price;
                $(selectorInput.description).value = res.description;
                $(selectorInput.img).src = res.imgUrl;
                $(selectorInput.category + ` option[value="${res.category}"]`).selected = true;
                $(selectorInput.status + ` input[value="${res.status}"]`).checked = true;
                buttonSubmit.dataset.type = 'edit';
                buttonSubmit.dataset.id = id;
            })
    },

    handleDelete (id,selector) {
        fetch (apiProLink + '/' + id, {
            method: "DELETE",
            headers: {
                'Content-type': 'application/json'
            }
        })
            .then(res => {
                    let formEl = $('.admin-from');
                    admin.renderTable();
                    showMessage.render('success','Xóa sản phẩm thành công');
                    formEl.classList.remove('submit');
                    formEl.querySelector('button[type="submit"] i').classList.remove('turn');
                    formEl.reset();
                    $('.image-img').src = urlDefault;
                }
            )
            .catch (err => {
                loading(true,selector);
                showMessage.render('err','Có lỗi gì đó đã xảy ra');
            });
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
    selectNameCate (id,categoryList) {
        return categoryList.find(item => item.id == id).name;
    },
    renderCate () {
        fetch(apiCateLink)
            .then(res => res.json())
            .then(res => {
                const htmls = res.map(item => {
                    return `
                        <option value="${item.id}">${item.name}</option>
                    `;
                }).join('');
                document.querySelector('.input-block__input.category').innerHTML = `<option value="">--- Chọn ---</option>` + htmls;
            })
    },
    renderTable () {
        loading(true,'.tableList tbody');
        fetch (apiProLink)
            .then(res => res.json())
            .then(res => {
                const htmls = res.map( (item,index) => {
                    return `
                        <tr data-id=${item.id}>
                            <td>${index + 1}</td>
                            <td>${item.name}</td>
                            <td>${item.price}</td>
                            <td>
                                <img src="${item.imgUrl}" alt="" class="imgProduct">
                            </td>
                            <td>${categoryList.find(item1 => item1.id == item.category).name}</td>
                            <td>${item.number > 0 ? 'Còn Hàng' : 'Hết hàng'}</td>
                            <td>
                                <button class="tableBtn edit">Sửa</button>
                                <button class="tableBtn delete">Xóa</button>
                            </td>
                        </tr>
                    `;
                }).join('');

                $('.tableList tbody').innerHTML = htmls || '<h1>Chưa có sản phẩm nào trong danh sách</h1>'
            }) 
    }
}

admin.start();

validate.option = {
    form: '.admin-from',
    errSelector: '.input-err',
    inputBlock: '.input-block',
    rules: [
        validate.isRequire('.input-block__input.name'),
        validate.minLength('.input-block__input.name',10),
        validate.isRequire('.input-block__input.number'),
        validate.isRequire('.input-block__input.price'),
        validate.isRequire('.input-block__input.category'),
        validate.isRequire('.input-block__input.description'),
    ],
    selectorElements: {
        name: '.input-block__input.name',
        number:'.input-block__input.number',
        price:'.input-block__input.price',
        category:'.input-block__input.category',
        description:'.input-block__input.description',
        imgUrl:'.input-block__input[type="file"]',
        status:'.input-block.radio input[name="status"]:checked',
    }
}
validate.start();
validate.previewImage('input[type="file"].input-block__input','.image-img'),
nextPage.start();

export default admin;