import random
from .card import Card

class AlgoGame:
    def __init__(self, player1, player2):
        self.players = [player1, player2]
        self.deck = []
        self.current_dealer = None
        self.current_attacker = None
        self.round = 1
        self.game_state = "DEALER_SELECTION"  # ゲームの状態
        self.game_over = False

    def determine_dealer(self):
        """親決めフェーズ"""
        self.deck = [Card(i) for i in range(12)] * 2
        random.shuffle(self.deck)
        card1 = self.deck.pop()
        card2 = self.deck.pop()
        card1.is_revealed = True
        card2.is_revealed = True
        
        self.current_dealer = 0 if card1.value < card2.value else 1
        self.current_attacker = self.current_dealer
        self.game_state = "DEALING"
        
        return {
            'dealer_cards': [card1.to_dict(), card2.to_dict()],
            'dealer_index': self.current_dealer
        }

    def deal_initial_cards(self):
        """初期カード配布"""
        self.deck = [Card(i) for i in range(12)] * 2
        random.shuffle(self.deck)
        
        # 各プレイヤーに4枚ずつ配る
        for player in self.players:
            player.hand = [self.deck.pop() for _ in range(4)]
            player.sort_hand()
        
        self.game_state = "PLAYING"

    def draw_card(self, player_index):
        """山札から1枚引く"""
        if len(self.deck) > 0 and player_index == self.current_attacker:
            card = self.deck.pop()
            self.players[player_index].attack_card = card
            return True, card
        return False, None

    def make_attack(self, attacker_index, target_position, guess_value):
        """アタックを実行"""
        if self.current_attacker != attacker_index:
            return False, "あなたのターンではありません"

        attacker = self.players[attacker_index]
        if not attacker.attack_card:
            return False, "アタックカードを引いてください"

        target_player = self.players[1 if attacker_index == 0 else 0]
        if target_position >= len(target_player.hand):
            return False, "無効な位置です"

        target_card = target_player.hand[target_position]
        if target_card.is_revealed:
            return False, "すでに開示されたカードです"

        if target_card.value == guess_value:
            # アタック成功
            target_card.is_revealed = True
            return True, "イエス！"
        else:
            # アタック失敗
            attacker.attack_card.is_revealed = True
            attacker.hand.append(attacker.attack_card)

    def serialize_state(self, player_id):
        return {
            'deck': [card.to_dict() for card in self.deck],
            'players': [{
                'hand': [card.to_dict() for card in player.hand],
                'attack_card': player.attack_card.to_dict() if player.attack_card else None
            } for player in self.players],
            'current_attacker': self.current_attacker,
            'player_id': player_id,
            'game_state': self.game_state
        }
