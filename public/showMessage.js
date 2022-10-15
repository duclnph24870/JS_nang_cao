const showMessage = {
    render (type,message) {
        const messageEl = document.querySelector('.message-notify');

        messageEl.innerText = message;
        messageEl.classList.add('active');
        messageEl.classList.add(type);

        setTimeout(() => {
            messageEl.classList.remove('active');
            messageEl.classList.remove(type);
        },3000)
    }
}

export default showMessage;