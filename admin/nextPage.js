const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// page active type number

const nextPage = {
    pageActive: JSON.parse(sessionStorage.getItem('pageActive')) || 0,
    start () {
        this.handleNextPage();
        this.nextPage('.content-right__addItem',undefined,1);
    },
    nextPage (selector,element,target) {
        if (element) {
            this.pageActive = target;
            sessionStorage.setItem('pageActive',JSON.stringify(nextPage.pageActive));
            nextPage.handleNextPage();
        }else {
            $(selector).onclick = () => {
                this.pageActive = target;
                sessionStorage.setItem('pageActive',JSON.stringify(nextPage.pageActive));
                nextPage.handleNextPage();
            }
        }
    },
    handleNextPage () {
        const pageBtns = $$('.content-left__item');
        const pageMains = $$('.content-right__main');

        const activeBtnEl = $('.content-left__item.active');
        const activeMainEl = $('.content-right__main.active');

        if (activeBtnEl && activeMainEl) {
            activeBtnEl.classList.remove('active');
            activeMainEl.classList.remove('active');
        }

        pageBtns[this.pageActive].classList.add('active');
        pageMains[this.pageActive].classList.add('active');

        $('.content-left').onclick = (e) => {
            if (e.target.closest('.content-left__item:not(.active)')) {
                const activeBtnEl = $('.content-left__item.active');
                const activeMainEl = $('.content-right__main.active');
                
                activeBtnEl.classList.remove('active');
                activeMainEl.classList.remove('active');

                e.target.closest('.content-left__item').classList.add('active');
                pageMains[+e.target.dataset.id].classList.add('active');

                // lưu page hiện tại vào sessionStorage
                sessionStorage.setItem('pageActive',JSON.stringify(e.target.dataset.id));
            }
        }
    },
}

export default nextPage;