from rest_framework import serializers

from ..main.models import Game, Player, Ship, Shot

class GameSerializer(serializers.ModelSerializer):
    creator = serializers.SerializerMethodField()
    opponent = serializers.SerializerMethodField()

    def get_creator(self, game):
        return game.creator.username

    def get_opponent(self, game):
        return game.opponent.username

    class Meta:
        model = Game
        fields = ['difficulty', 'id']
        read_only_fields = ['status', 'creator', 'opponent', 'created_at', 'winner', 'turn']
        
        
class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['username', 'xp', 'level', 'point']
        
class ShipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ship
        fields = ['size', 'start_x', 'start_y', 'is_vertical']
        

class ShotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shot
        fields = ['x', 'y']
