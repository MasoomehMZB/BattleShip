from rest_framework import serializers

from main.models import Game, Player, Ship, Shot

class GameSerializer(serializers.ModelSerializer):
    creator = serializers.SerializerMethodField()
    opponent = serializers.SerializerMethodField()

    def get_creator(self, game):
        return game.creator.username
    
    def get_opponent(self, game):
        return game.opponent.username if game.opponent else None

    class Meta:
        model = Game
        fields = ['difficulty', 'id',  'creator', 'opponent']
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
