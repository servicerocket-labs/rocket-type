let socket = null;
const username = `user_${Math.floor(Math.random() * 1000)}`

const piesocket = window.piesocket = {
    connect: () => {
        const channelId = prompt('What is your channelId?');
        if (channelId === '' || channelId == null)
            return;

        console.log('connecting...');
        piesocket.init(channelId);
    },
    init: (channelId) => {
        fetch('../config.json')
            .then(response => response.json())
            .then(data => connect(data, channelId))
            .catch(error => console.error('Error:', error));
    },
    send: (event, data) => {
        // console.log(event, data);
        if (socket == null)
            return;

        socket.send(JSON.stringify({
            event: event,
            sender: username,
            data: data,
        }));
    },
    resetQuote: () => {
        const _quoteBtn = document.getElementById('quoteBtn');
        _quoteBtn.classList.add('d-none');
        delete window.quote;
    },
};

async function connect(config, cid) {
    const apiKey = config.piesocket_apikey;
    const channelId = cid || 8080;
    const _connectBtn = document.getElementById('connectBtn');

    // socket = new WebSocket(`wss://connect.websocket.in/v3/${channelId}?api_key=${apiKey}`);
    socket = new WebSocket(`ws://localhost:8081`);

    socket.onopen = () => {
        console.log('connected to piesocket!');
        
        _connectBtn.classList.remove('btn-secondary');
        _connectBtn.classList.add('btn-success');
        _connectBtn.setAttribute('disabled', true);

        const _channelId = document.getElementById('channelId');
        _channelId.innerHTML = channelId;

        socket.send(JSON.stringify({
            event: 'join',
            sender: username,
        }));
    };

    socket.onmessage = (message) => {
        const payload = JSON.parse(message.data);
        const _quoteBtn = document.getElementById('quoteBtn');

        if (payload.error) {
            alert(payload.error);

            _connectBtn.classList.remove('btn-success');
            _connectBtn.classList.add('btn-secondary');

            socket.close();
            return;
        }
        console.log(payload);

        if (payload.event == 'quote') {
            _quoteBtn.classList.remove('d-none');
            window.quote = {
                text: payload.text,
                author: payload.author,
            };
        }
    };
};
