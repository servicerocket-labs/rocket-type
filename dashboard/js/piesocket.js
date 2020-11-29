const players = {};

const piesocket = window.piesocket = {
    connect: (player) => {
        const channelId = document.getElementById(player + 'Channel').value;
        if (channelId === '' || channelId == null)
            return;
            
        if (!isConnect(player))
            piesocket.init(channelId, player);
        else
            disconnect(player);
    },
    init: async (channelId, player) => {
        fetch('../config.json')
            .then(response => response.json())
            .then(data => connect(data, channelId, player))
            .then(() => alert(player + ' is connected!'))
            .catch(error => console.error('Error:', error));
    },
    sendQuote: () => {
        sendQuote('p1');
        sendQuote('p2');
    },
};

function isConnect(player) {
    return players[player] != null;
}

function disconnect(player) {
    if (players[player] == null)
        return;

    players[player].socket.close();
    delete players[player];

    const _btn = document.getElementById(player + 'Btn');
    _btn.innerHTML = "Connect"
    _btn.classList.remove('btn-danger');
}

async function connect(config, cid, player) {
    const apiKey = config.piesocket_apikey;
    const channelId = cid || 8080;

    // check if has player have existing connection
    if (players[player] != null)
        return;

    const obj = players[player] = {};
    obj.socket = new WebSocket(`wss://connect.websocket.in/v3/${channelId}?api_key=${apiKey}`);

    const _btn = document.getElementById(player + 'Btn');
    const _logs = document.getElementById(player + 'Logs');
    const _progress = document.getElementById(player + 'Progress');
    const _preview = document.getElementById(player + 'Preview');
    const _previewDone = document.getElementById(player + 'PreviewDone');
    const _previewText = document.getElementById(player + 'PreviewText');
    const _rawcpm = document.getElementById(player + 'RawCpm');
    const _cpm = document.getElementById(player + 'Cpm');
    const _wpm = document.getElementById(player + 'Wpm');
    const _accuracy = document.getElementById(player + 'Accuracy');
    const _time = document.getElementById(player + 'Time');


    obj.socket.onopen = () => {
        _btn.innerHTML = "Disconnect";
        _btn.classList.add('btn-danger');
    };

    let quote = ''
    obj.socket.onmessage = (message) => {
        var payload = JSON.parse(message.data);
        if (payload.error) {
            alert(payload.error);
            return;
        }

        if (payload.data)
            _logs.insertAdjacentHTML('afterbegin', `${payload.event} <code>${JSON.stringify(payload.data)}</code><br>`);
        else
            _logs.insertAdjacentHTML('afterbegin', `${payload.event} <code>${JSON.stringify(payload)}</code><br>`);

        switch (payload.event) {
            case 'start':
                quote = payload.data.quote;
                _progress.classList.remove('progress-bar-striped');
                _progress.setAttribute('style', 'width: 0%;');
                _progress.innerHTML = '0%';
                _previewDone.innerHTML = '';
                _previewText.innerHTML = quote;
                _rawcpm.innerHTML = 0;
                _cpm.innerHTML = 0;
                _wpm.innerHTML = 0;
                _accuracy.innerHTML = 0;
                _time.innerHTML = 0;
                break;

            case 'progress':
                const progress = Math.floor(payload.data.typedIndex * 100 / payload.data.quoteLength) + '%';
                _progress.setAttribute('style', `width: ${progress};`);
                _progress.innerHTML = progress;
                _previewDone.innerHTML = quote.substr(0, payload.data.typedIndex);
                _previewText.innerHTML = quote.substr(payload.data.typedIndex);
                _rawcpm.innerHTML = payload.data.rawcpm;
                _cpm.innerHTML = payload.data.cpm;
                _wpm.innerHTML = payload.data.wpm;
                _accuracy.innerHTML = payload.data.accuracy;
                _time.innerHTML = payload.data.seconds;
                break;

            case 'stop':
                _progress.classList.add('progress-bar-striped');
                _rawcpm.innerHTML = payload.data.rawcpm;
                _cpm.innerHTML = payload.data.cpm;
                _wpm.innerHTML = payload.data.wpm;
                _accuracy.innerHTML = payload.data.accuracy;
                break;
        }
    };

    function updateProgress(data) {

    }

    function updatePreview(data) {

    }
};

function sendQuote(player) {
    if (!isConnect(player))
        return;

    const _quote = document.getElementById('allQuote');
    players[player].socket.send(JSON.stringify({
        event: 'quote',
        text: _quote.value,
        author: 'ServiceRocket Challenge',
    }));
}