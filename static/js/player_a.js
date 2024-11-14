document.addEventListener('DOMContentLoaded', function() {
    const socket = io();
    const playerType = 'A';
    
    socket.on('connect', function() {
        console.log('Player A connected to server');
        statusDiv.textContent = 'サーバーに接続しました';
    });

    const joinForm = document.getElementById('join-form');
    const statusDiv = document.getElementById('status');
    const gameDiv = document.getElementById('game');

    joinForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const roomId = document.getElementById('room-id').value;
        console.log('Player A joining room:', roomId);
        
        socket.emit('join', {
            room: roomId,
            player_type: playerType
        });
    });

    socket.on('room_status', function(data) {
        console.log('Room status:', data);
        statusDiv.textContent = `ルーム ${data.room} のプレイヤー数: ${data.players}`;
        
        if (data.players === 2) {
            statusDiv.textContent += ' - ゲーム開始準備完了！';
        }
    });

    socket.on('game_state', function(data) {
        console.log('Game state received:', data);
        updateGameDisplay(data);
    });

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

    function updateGameDisplay(gameState) {
        if (!gameState) return;

        let gameInfo = '<div class="game-state">';
        
        // 手札の表示
        if (gameState.players && gameState.players[0]) {
            gameInfo += '<div class="player-hand">';
            gameInfo += '<h3>あなたの手札</h3>';
            gameState.players[0].hand.forEach(card => {
                gameInfo += `<div class="card">${card.visible ? card.value : '?'}</div>`;
            });
            gameInfo += '</div>';
        }

        // アタックカードの表示
        if (gameState.players[0].attack_card) {
            gameInfo += '<div class="attack-card">';
            gameInfo += '<h3>アタックカード</h3>';
            gameInfo += `<div class="card">${gameState.players[0].attack_card.value}</div>`;
            gameInfo += '</div>';
        }

        gameInfo += '</div>';
        gameDiv.innerHTML = gameInfo;
    }

    socket.on('error_message', function(data) {
        console.error('Error:', data);
        statusDiv.textContent = `エラー: ${data.message}`;
    });
}); 