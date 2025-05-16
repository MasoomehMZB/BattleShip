from rest_framework import serializers

from main.models import Game, Player, Ship, Shot

class GameSerializer(serializers.ModelSerializer):
    creator = serializers.SerializerMethodField()
    opponent = serializers.SerializerMethodField()
    winner = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    difficulty = serializers.SerializerMethodField()
    
    def get_difficulty(self, game):
        return game.get_difficulty_display()

    def get_status(self, game):
        return game.get_status_display()
    
    def get_winner(self, game):
        return game.winner.username if game.winner else None
    

    def get_creator(self, game):
        return game.creator.username
    
    def get_opponent(self, game):
        return game.opponent.username if game.opponent else None

    class Meta:
        model = Game
        fields = ['difficulty', 'id',  'creator', 'opponent', 'status', 'winner', 'created_at']
        read_only_fields = ['status', 'creator', 'opponent', 'created_at', 'winner', 'turn']
        
        
class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['username', 'level', 'points', 'total_games']
        
class ShipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ship
        fields = ['size', 'start_x', 'start_y', 'is_vertical']
        

class ShotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shot
        fields = ['x', 'y']
