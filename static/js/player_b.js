document.addEventListener('DOMContentLoaded', function() {
    const socket = io();
    const playerType = 'B';
    
    let currentGameState = null;
    let currentRoom = null;

    const joinForm = document.getElementById('join-form');
    const statusDiv = document.getElementById('status');
    const gameDiv = document.getElementById('game');

    socket.on('connect', function() {
        console.log('Player B connected to server');
        statusDiv.textContent = 'サーバーに接続しました';
    });

    // ルーム参加処理の修正
    joinForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const roomId = document.getElementById('room-id').value;
        currentRoom = roomId;
        console.log('Player B joining room:', roomId);
        
        // イベント名を'join'に変更
        socket.emit('join', {
            room: roomId,
            player_type: playerType
        });
    });

    // ルームステータス受信の修正
    socket.on('room_status', function(data) {
        console.log('Room status:', data);
        statusDiv.textContent = `ルーム ${data.room} のプレイヤー数: ${data.players}`;
        
        if (data.players === 2) {
            statusDiv.textContent += ' - ゲーム開始準備完了！';
        }
    });

    // ゲーム状態の更新と表示
    socket.on('game_state', function(data) {
        console.log('Game state received:', data);
        currentGameState = data;
        updateGameDisplay();
    });

    // 親決めの結果表示
    socket.on('dealer_selection', function(data) {
        console.log('Dealer selection:', data);
        let dealerInfo = '<div class="dealer-selection">';
        dealerInfo += '<h2>親決めの結果</h2>';
        
        data.dealer_cards.forEach((card, index) => {
            dealerInfo += `<div class="dealer-card">プレイヤー${index + 1}: ${card.value}</div>`;
        });
        
        dealerInfo += `<div class="dealer-result">親プレイヤー: プレイヤー${data.dealer_index + 1}</div>`;
        dealerInfo += '</div>';
        
        gameDiv.innerHTML = dealerInfo;
    });

    // ゲーム画面の更新処理の修正
    function updateGameDisplay() {
        if (!currentGameState) return;

        let gameInfo = '<div class="game-state">';
        
        // 手札の表示
        if (currentGameState.players && currentGameState.players[1]) {
            gameInfo += '<div class="player-hand">';
            gameInfo += '<h3>あなたの手札</h3>';
            currentGameState.players[1].hand.forEach((card, index) => {
                gameInfo += `<div class="card" data-index="${index}">
                    ${card.visible ? card.value : '?'}
                </div>`;
            });
            gameInfo += '</div>';
        }

        // アタックカードの表示
        if (currentGameState.players[1].attack_card) {
            gameInfo += '<div class="attack-card">';
            gameInfo += '<h3>アタックカード</h3>';
            gameInfo += `<div class="card">${currentGameState.players[1].attack_card.value}</div>`;
            gameInfo += '</div>';
        }

        // 相手の手札情報
        if (currentGameState.players && currentGameState.players[0]) {
            gameInfo += '<div class="opponent-hand">';
            gameInfo += '<h3>相手の手札</h3>';
            currentGameState.players[0].hand.forEach(card => {
                gameInfo += `<div class="card">${card.visible ? card.value : '?'}</div>`;
            });
            gameInfo += '</div>';
        }

        gameInfo += '</div>';
        gameDiv.innerHTML = gameInfo;
    }

    // エラー処理
    socket.on('error_message', function(data) {
        console.error('Error:', data);
        statusDiv.textContent = `エラー: ${data.message}`;
    });
}); 