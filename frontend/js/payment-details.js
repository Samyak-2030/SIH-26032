const historyButton = document.querySelector('#history-button');
const historyMessage = document.querySelector('#history-message');

historyButton.addEventListener('click', () => {
    const isVisible = !historyMessage.hidden;
    historyMessage.hidden = isVisible;
    historyButton.textContent = isVisible ? 'View Transaction History' : 'Hide Transaction History';
});
