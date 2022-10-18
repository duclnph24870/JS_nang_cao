import { loading } from "./loading.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

var productList = [];
var apiLink = 'http://localhost:4013/products';

const search = {

    start () {
        this.searchKeyword();
    },

    timeoutCurr: undefined,

    search (type,value,productList) {
        if (type == 'search') {
            // tìm kiếm bằng từ khóa
            const result = productList.filter((item) => {
                return this.removeVietnameseTones(item.name).indexOf(value) != -1;
            });

            return result;
        }else if (type == 'filter') {
            // tìm kiếm bằng thể loại
            if (value == 'all') {
                return productList;
            }

            const result = productList.filter(item => {
                return item.category == value;
            });

            return result;
        }
    },

    searchKeyword () {
        const inputEl = $('.search__input');
        inputEl.oninput = () => {
            $('.search__result').innerHTML = '';
            if (search.timeoutCurr) {
                clearTimeout(search.timeoutCurr);
            }

            search.timeoutCurr = setTimeout (function () {
                loading(true,'.search .search__icon');
                const inputVl = inputEl.value;
                fetch(apiLink)
                    .then(res => {
                        return res.json();
                    })
                    .then(res => {
                        $('.search .search__icon').innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
                        productList = res;
                        const result = search.search('search',search.removeVietnameseTones(inputVl),productList);
                        $('.search__result').innerHTML = result.map((item,index) => {
            
                            return index < 5 ? `
                                <div class="search__result-item">
                                    <div class="search__result-image">
                                        <img src="${item.imgUrl}" alt="">
                                    </div>
                                    <div class="search__result-content">
                                        <div class="search__result-name">${item.name}</div>
                                        <div class="search__result-price">${item.price} VNĐ</div>
                                    </div>
            
                                    <i class="fa-solid fa-magnifying-glass search__result-icon"></i>
                                </div>
                            ` : '';
                        }).join('') || '<div class="search__result-item" style="font-size: 1.5rem;">Không tìm thấy sản phẩm</div>';
                    })
            },800);
        }
    },

    removeVietnameseTones(str) {
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
        str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
        str = str.replace(/đ/g,"d");
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
        str = str.replace(/Đ/g, "D");
        // Some system encode vietnamese combining accent as individual utf-8 characters
        // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
        str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
        str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
        // Remove extra spaces
        // Bỏ các khoảng trắng liền nhau
        str = str.replace(/ + /g," ");
        str = str.trim();
        // Remove punctuations
        // Bỏ dấu câu, kí tự đặc biệt
        str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
        return str.toLowerCase();
    },
};

export default search;