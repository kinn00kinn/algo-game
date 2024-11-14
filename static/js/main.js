document.addEventListener('DOMContentLoaded', function() {
    const socket = io();
    const statusDiv = document.getElementById('status');
    
    // 接続状態の表示を追加
    socket.on('connect', function() {
        console.log('Connected to server');
        statusDiv.textContent = 'サーバーに接続しました';
    });

    // ルーム参加処理の改善
    function joinRoom(roomId) {
        console.log('Attempting to join room:', roomId);
        statusDiv.textContent = `ルーム ${roomId} に接続中...`;
        
        socket.emit('join', {
            room: roomId,
            player_type: window.location.pathname.includes('player_a') ? 'A' : 'B'
        });
    }

    // ルームステータス受信の改善
    socket.on('room_status', function(data) {
        console.log('Room status received:', data);
        statusDiv.textContent = `ルームステータス: ${JSON.stringify(data)}`;
        
        if (data.players === 2) {
            statusDiv.textContent = 'ゲーム開始準備完了！';
        }
    });

    // フォームの送信処理の改善
    const joinForm = document.getElementById('join-form');
    if (joinForm) {
        joinForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const roomId = document.getElementById('room-id').value;
            if (roomId) {
                joinRoom(roomId);
            } else {
                alert('ルームIDを入力してください');
            }
        });
    }

    // エラー処理の改善
    socket.on('error', (error) => {
        console.error('Socket error:', error);
        statusDiv.textContent = `エラー: ${error.message}`;
    });
});
