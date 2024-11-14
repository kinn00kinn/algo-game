import random

class AIPlayer:
    def __init__(self, game_state):
        self.game_state = game_state
        self.known_values = set()

    def make_move(self):
        # 単純なAIロジック
        target_position = random.randint(0, 2)
        possible_values = [i for i in range(12) if i not in self.known_values]
        guess_value = random.choice(possible_values)
        self.known_values.add(guess_value)
        return {
            'target_position': target_position,
            'guess_value': guess_value
        } 