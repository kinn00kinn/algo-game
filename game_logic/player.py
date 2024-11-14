import random
from .card import Card

class Player:
    def __init__(self, name):
        self.name = name
        self.hand = []
        self.score = 0
        self.attack_card = None  # 現在アタックに使用中のカード

    def draw_hand(self):
        self.hand = sorted([Card(random.randint(0, 11)) for _ in range(3)])

    def __str__(self):
        return f"{self.name}の手札: {self.hand}"

    def sort_hand(self):
        self.hand.sort()  # 手札を昇順にソート
