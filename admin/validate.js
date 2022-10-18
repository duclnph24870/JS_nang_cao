import showMessage from '../public/showMessage.js';
import admin from './admin.js';

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const productApi = 'http://localhost:4013/products';
const apiProLink = 'http://localhost:4013/products';
const urlDefault = 'https://branditechture.agency/brand-logos/wp-content/uploads/2022/06/pizza-hut.png';

const validate = {
    option: {},
    linkPreview: undefined,
    start () {
        this.handleValidate(this.option);
        // this.submit();
    },

    uploadItem (type = 'add',id = undefined,data) {
        if (type == 'add') {
            return fetch(productApi,{
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        }else if (type == 'edit' && id) {
            return fetch(productApi + '/' + id,{
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        }
    },

    handleValidate (options) {
        var selectorRules = {};
        // lấy ra các element dùng chung
        const formEl = $(options.form);

        // duyệt qua các rules
        options.rules.forEach( rule => {

            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            }else {
                selectorRules[rule.selector] = [rule.test];
            }

            const inputEl = $(rule.selector);
            const parentEl = inputEl.closest(options.inputBlock);
            
            inputEl.onblur = (e) => {
                const selectorRule = selectorRules[rule.selector];

                for (let i = 0; i < selectorRule.length;i++) {
                    let messageErr = selectorRule[i](e.target.value);
                    const errEl = inputEl.closest(options.inputBlock).querySelector(options.errSelector);


                    if (messageErr) {
                        parentEl.classList.add('err');
                        errEl.innerText = messageErr;
                        break;
                    }
                }
            }

            inputEl.oninput = () => {
                parentEl.classList.remove('err');
                parentEl.querySelector(options.errSelector).innerText = '';
            }
        });

        // submit
        formEl.onsubmit = (e) => {
            var buttonSubmit = formEl.querySelector('button[type="submit"]');
            const buttonType = buttonSubmit.dataset.type;
            const buttonId = buttonSubmit.dataset.id || undefined;

            e.preventDefault();
            var isSubmit = true;
            options.rules.forEach(rule => {
                const inputEl = $(rule.selector);
                const parentEl = inputEl.closest(options.inputBlock);
                const selectorRule = selectorRules[rule.selector];

                for (let i = 0; i < selectorRule.length;i++) {
                    let messageErr = selectorRule[i](inputEl.value);
                    const errEl = inputEl.closest(options.inputBlock).querySelector(options.errSelector);

                    if (messageErr) {
                        parentEl.classList.add('err');
                        errEl.innerText = messageErr;
                        isSubmit = false;
                        break;
                    }
                }
            })

            if (isSubmit) {
                formEl.classList.add('submit');
                formEl.querySelector('button[type="submit"] i').classList.add('turn');

                let dataSubmit = {};

                const selectorElements = options.selectorElements;
                let keyElements = Object.keys(selectorElements);
                
                let selectorCurr = undefined;
                let inputElement = undefined;
                for (let i = 0; i < keyElements.length;i++) {
                    selectorCurr = selectorElements[keyElements[i]];
                    inputElement = $(selectorCurr);

                    if (inputElement.type == 'file') {
                        dataSubmit['imgUrl'] = inputElement.files[0] || $('.image-img').src;
                    }else {
                        dataSubmit[keyElements[i]] = inputElement.value;
                    }
                }

                dataSubmit['number'] = Number(dataSubmit['number']);

                if (typeof dataSubmit['imgUrl'] != 'string') {
                    // trường hợp ảnh được chọn
                    const reader = new FileReader();
                    reader.readAsDataURL(dataSubmit['imgUrl']);

                    reader.onloadend = () => {
                        let imgValue = reader.result;
                        // upload ảnh
                        fetch('https://image-uploader-anhhtus.herokuapp.com/api/upload', {
                            method: "POST",
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({data: imgValue})
                        })
                            .then(res => res.json())
                            .then(res => {
                                dataSubmit.imgUrl = res.secure_url;
                                // upload item lên database
                                validate.uploadItem(buttonType,buttonId,dataSubmit)
                                    .then(res => {
                                        formEl.classList.remove('submit');
                                        formEl.querySelector('button[type="submit"] i').classList.remove('turn');
                                        formEl.reset();
                                        $('.image-img').src = urlDefault;
                                        $('.image__input').innerHTML = `
                                                    <i class="fas fa-image"></i>
                                                    Chọn hình ảnh sản phẩm
                                        `;
                                        showMessage.render('success','Tải sản phẩm lên thành công');
                                        admin.renderTable();
                                        buttonSubmit.dataset.type = 'add';
                                        buttonSubmit.dataset.id = '';
                                    })
                                    .catch(err => {
                                        showMessage.render('err','Đã xảy ra sự cố!!!');
                                    })
                            })
                            .catch(err => {
                                formEl.classList.remove('submit');
                                formEl.querySelector('button[type="submit"] i').classList.remove('turn');
                                showMessage.render('err','Kích thước hình ảnh quá lớn!!!');
                            })
                    }

                }else {
                    validate.uploadItem(buttonType,buttonId,dataSubmit)
                        .then(res => {
                            formEl.classList.remove('submit');
                            formEl.querySelector('button[type="submit"] i').classList.remove('turn');
                            formEl.reset();
                            $('.image-img').src = urlDefault;
                            $('.image__input').innerHTML = `
                                        <i class="fas fa-image"></i>
                                        Chọn hình ảnh sản phẩm
                            `;
                            showMessage.render('success','Tải sản phẩm lên thành công');
                            admin.renderTable();
                            buttonSubmit.dataset.type = 'add';
                            buttonSubmit.dataset.id = '';
                        })
                        .catch(err => {
                            showMessage.render('err','Đã xảy ra sự cố!!!');
                        })
                }
            }
        }

    },

    previewImage (selector,imgSelector) {
        const inputEl = $(selector);
        const imgEl = $(imgSelector);

        inputEl.onchange = (e) => {
            if (validate.linkPreview) {
                console.log(validate.linkPreview);
                URL.revokeObjectURL(validate.linkPreview);
            }
            const file = e.target.files[0];
            validate.linkPreview = URL.createObjectURL(file); 
            
            imgEl.src = validate.linkPreview;
            $('.image__input').innerText = file.name;
        }
    },

    isRequire (selector,message) {
        return {
            selector,
            test (value) {
                return value ? undefined : message || "Trường này là trường bắt buộc"; 
            }
        }
    },
    minLength (selector,min,message) {
        return {
            selector,
            test (value) {
                return value.length > min ? undefined : message || "Số ký tự bắt buộc phải lớn hơn "+min; 
            }
        }
    }
}

export default validate;