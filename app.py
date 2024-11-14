from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from game_logic.algo_game import AlgoGame
from game_logic.player import Player

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
socketio = SocketIO(app, cors_allowed_origins="*")

games = {}
player_rooms = {}

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')

@socketio.on('join')
def handle_join(data):
    """特定のルームに参加"""
    print(f"Join room request received for room: {data['room']}")
    
    room = data['room']
    if not room:
        emit('error_message', {'message': 'ルームIDが必要です'})
        return
        
    join_room(room)
    player_rooms[request.sid] = room
    
    if room not in games:
        games[room] = {
            'game': None,
            'players': []
        }
    
    if request.sid not in games[room]['players']:
        games[room]['players'].append(request.sid)
    
    # ルームの状態を全員に通知
    room_status = {
        'room': room,
        'players': len(games[room]['players'])
    }
    emit('room_status', room_status, room=room)
    
    # 2人目のプレイヤーが参加したらゲームを開始
    if len(games[room]['players']) == 2:
        start_game(room)

def start_game(room):
    """ゲームの開始処理"""
    player1 = Player("Player 1")
    player2 = Player("Player 2")
    games[room]['game'] = AlgoGame(player1, player2)
    
    # 親決めの実行
    dealer_result = games[room]['game'].determine_dealer()
    emit('dealer_selection', dealer_result, room=room)
    
    # 初期カードの配布
    games[room]['game'].deal_initial_cards()
    
    # 各プレイヤーに初期状態を送信
    for i, player_sid in enumerate(games[room]['players']):
        game_state = games[room]['game'].serialize_state(i)
        emit('game_state', game_state, room=player_sid)

@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    if sid in player_rooms:
        room = player_rooms[sid]
        if room in games:
            games[room]['players'].remove(sid)
            if len(games[room]['players']) == 0:
                del games[room]
            else:
                # 残りのプレイヤーに通知
                emit('player_disconnected', room=room)
        del player_rooms[sid]
        leave_room(room)

@app.route('/player_a')
def player_a():
    return render_template('player_a.html')

@app.route('/player_b')
def player_b():
    return render_template('player_b.html')

if __name__ == '__main__':
    socketio.run(app, debug=True)
