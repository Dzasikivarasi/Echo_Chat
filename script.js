const MESSAGE_CONNECTED = 'Соединение установлено';
const MESSAGE_ERROR = 'Произошла ошибка при попытке подключения к серверу';
const MESSAGE_CLOSE = 'Соединение с сервером закрыто или потеряно';
const MESSAGE_GEOLOCATION_NOT_SUPPORTED = 'Геолокация не поддерживается вашим браузером';
const MESSAGE_GEOLOCATION_NOT_DEFINED = 'Не удалось определить ваше местоположение';
const MESSAGE_GEOLOCATION_DEFINING = 'Определение местоположения...'

const wsUrl = "wss://echo-ws-service.herokuapp.com";

const output = document.getElementById("output");
const openButton = document.getElementById('open_button');
const closeButton = document.getElementById('close_button');
const sendButton = document.querySelector('.chat__message-send');
const messageInput = document.querySelector('.chat__message-text');
const container = document.querySelector('.container');
const chat = document.querySelector('.chat');
const locationButton = document.querySelector('.chat__message-location');

let websocket;

// Функции-обработчики для кнопок
const onDocumentKeydownClose = (evt) => {
    if (evt.key === 'Escape') {
        evt.preventDefault();
        closeChat()
    }
};

const onDocumentKeydownSend = (evt) => {
    if (evt.key === 'Enter') {
        evt.preventDefault();
        sendMessage();
    }
};

// Функция отрисовки сообщений
function renderMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('output__message', type);

    if (message.type === 'location') {
        const link = document.createElement('a');
        link.href = message.url;
        link.innerText = 'Гео-локация';
        link.target = '_blank';
        link.style.color = 'white';
        messageDiv.appendChild(link);
    } else {
        messageDiv.innerText = message;
    }
    output.prepend(messageDiv);
}

// Функция отрисовки уведомлений
function renderAlert(message) {
    const connectionPopup = document.createElement('div');
    connectionPopup.classList.add('alert');
    connectionPopup.innerText = message;
    document.body.appendChild(connectionPopup);
    setTimeout(() => {
        connectionPopup.remove();
    }, 2000);
}

// Функция открытия чата и настройки Web Socket
function onChatOpen() {
    websocket = new WebSocket(wsUrl);

    websocket.onopen = function () {
        renderAlert(MESSAGE_CONNECTED);
        container.classList.add('hidden');
        chat.classList.remove('hidden');
    };

    websocket.onmessage = function (event) {
        if (event.data.startsWith('https://www.openstreetmap.org/')) {
            return;
        }
        renderMessage(event.data, 'server');
    };

    websocket.onerror = function (error) {
        renderAlert(MESSAGE_ERROR);
    };

    websocket.onclose = function (event) {
        renderAlert(MESSAGE_CLOSE);
    };

    document.addEventListener('keydown', onDocumentKeydownClose);
    messageInput.addEventListener('keydown', onDocumentKeydownSend);
}

// Функция закрытия чата
function closeChat() {
    if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
    }
    chat.classList.add('hidden');
    container.classList.remove('hidden');
    document.removeEventListener('keydown', onDocumentKeydownClose);
    messageInput.removeEventListener('keydown', onDocumentKeydownSend);
}

// Функция отправки сообщения
function sendMessage() {
    const message = messageInput.value;

    if (message && websocket.readyState === WebSocket.OPEN) {
        renderMessage(message, 'client');
        websocket.send(message);
        messageInput.value = '';
    }
}

// Функция определения геолокации
function sendLocation() {
    if (!navigator.geolocation) {
        renderAlert(MESSAGE_GEOLOCATION_NOT_SUPPORTED);
        return;
    }

    function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const url = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
    
        renderMessage({ url: url, type: 'location' }, 'client');
        websocket.send(url); 
    }

    function error() {
        renderAlert(MESSAGE_GEOLOCATION_NOT_DEFINED);
    }

    renderAlert(MESSAGE_GEOLOCATION_DEFINING);
    navigator.geolocation.getCurrentPosition(success, error);
}

// Вешаем обработчики
locationButton.addEventListener('click', sendLocation);
openButton.addEventListener('click', onChatOpen);
closeButton.addEventListener('click', closeChat);
sendButton.addEventListener('click', sendMessage);
