const notifyToggle = document.querySelector('#notify-toggle');
const queueMessage = document.querySelector('#queue-message');
const countdown = document.querySelector('#refresh-countdown');
const lastUpdated = document.querySelector('#last-updated');
let secondsLeft = 30;

notifyToggle.addEventListener('change', () => {
    queueMessage.textContent = notifyToggle.checked
        ? 'You will be notified when your turn is near.'
        : 'Turn notifications are turned off.';
});

setInterval(() => {
    secondsLeft -= 1;
    countdown.textContent = secondsLeft;

    if (secondsLeft === 0) {
        secondsLeft = 30;
        countdown.textContent = secondsLeft;
        lastUpdated.textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        queueMessage.textContent = 'Queue status refreshed.';
    }
}, 1000);
