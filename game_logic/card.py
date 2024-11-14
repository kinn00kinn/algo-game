class Card:
    def __init__(self, value):
        self.value = value
        self.is_revealed = False
    
    def __repr__(self):
        return str(self.value) if self.is_revealed else "?"
    
    def __lt__(self, other):
        return self.value < other.value
    
    def __eq__(self, other):
        return self.value == other.value
    
    def to_dict(self):
        return {
            'value': self.value,
            'visible': self.is_revealed,
            # その他のカードの属性
        }
