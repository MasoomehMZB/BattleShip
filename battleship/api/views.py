# Django imports
from django.forms import ValidationError
from django.shortcuts import get_object_or_404, render
from django.db.models import Q

# DRF imports
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# Local imports
from api.serializers import GameSerializer, PlayerSerializer, ShipSerializer, ShotSerializer
from main.models import Board, Game, Player, Ship, Shot


class CreateGameAPIView(CreateAPIView):
    serializer_class = GameSerializer

    def create(self, request, *args, **kwargs):
        player = self.request.user

        # Check if player has an unfinished game
        if (request.user.games_created.exclude(status=1).exists() or
            request.user.games_competed.exclude(status=1).exists()):
            return Response({'error': 'You have already joined a game.'}, status=400)

        # Create a new game
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        game = serializer.save(creator=player, status=0)
        
        request.user.total_games += 1
        request.user.save()
        
        return Response(serializer.data, status=201)

class JoinGameView(APIView):

    def post(self, request, *args, **kwargs):
        game_id = kwargs.get('game_id')
        game = get_object_or_404(Game, id=game_id)
        
        if game.status != 0:  # Waiting
                return Response({'error': 'Game is already full.'}, status=400)
            
        # Check if player has an unfinished game
        if (request.user.games_created.exclude(status=1).exists() or
            request.user.games_competed.exclude(status=1).exists()):
            return Response({'error': 'You have already joined a game.'}, status=400)
        
        if game.creator == request.user:
            return Response({'error': 'You cannot join your own game.'}, status=400)
        
        game.opponent = request.user
        game.status = 2  # in_progress
        request.user.total_games += 1
        request.user.save()
        game.save()
        return Response({'message': 'Game joined successfully.'}, status=200)


class ArrangeBoardView(APIView):
    def post(self, request, *args, **kwargs):
        game = get_object_or_404(Game, id=kwargs.get('game_id'))
        
        if request.user != game.creator and request.user != game.opponent:
            return Response({'error': 'You are not a player in this game.'}, status=403)
        
        if game.status != 2:  # in_progress
            return Response({'error': 'Game is not in the setup phase.'}, status=400)
        
        if game.boards.filter(player=request.user).exists():
            return Response({'error': 'You have already arranged your board.'}, status=400)

        ships_data = request.data.get('ships', [])
        if not ships_data:
            return Response({'error': 'No ships provided.'}, status=400)

        board = Board(game=game, player=request.user)
        board.set_size()

        serializer = ShipSerializer(data=ships_data, many=True)
        serializer.is_valid(raise_exception=True)

        try:
            board.validate_ships(serializer.validated_data)
            board.save()
            board.place_ships(serializer.validated_data)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
        

        # Set the turn after both boards are ready
        if game.boards.count() == 2:
            game.turn = game.creator
            game.save()

        return Response({'message': 'Board populated successfully.'}, status=201)
    
    

class HitView(APIView):
    def post(self, request, *args, **kwargs):
        game = get_object_or_404(Game, id=kwargs.get('game_id'))

        if game.turn != request.user:
            return Response({'error': 'Not your turn.'}, status=400)

        if request.user != game.creator and request.user != game.opponent:
            return Response({'error': 'You are not a player in this game.'}, status=403)
        
        opponent_board = game.get_opponent_board(request.user)
        if not opponent_board:
            return Response({'error': 'Opponent board not found.'}, status=404)

        shot_serializer = ShotSerializer(data=request.data)
        shot_serializer.is_valid(raise_exception=True)
        x, y = shot_serializer.validated_data['x'], shot_serializer.validated_data['y']

        try:
            opponent_board.validate_shot(x, y)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)

        hit, hit_ship = opponent_board.register_hit(x, y)

        # Create the shot
        Shot.objects.create(
            board=opponent_board,
            shooter=request.user,
            x=x,
            y=y,
            hit=hit
        )

        # Check if all opponent ships are sunk
        if opponent_board.all_ships_sunk():
            game.set_winner(request.user)

            return Response({
                'message': 'Game over. You won!',
                'game': GameSerializer(game).data,
                'winner': PlayerSerializer(request.user).data
            }, status=200)

        # Switch turns if game isn't over
        game.switch_turn()

 
        if hit and hit_ship:
            serialized_ship = ShipSerializer(hit_ship).data
        else:
            serialized_ship = None

        return Response({'hit': hit, 'ship':serialized_ship}, status=201)
    


# Acount data endpoint
class AccountDataView(APIView):
    def get(self, request, *args, **kwargs):
        user = request.user
        player = Player.objects.get(username=user.username)
        serializer = PlayerSerializer(player)
        return Response(serializer.data, status=200)
    
# Register endpoint
class RegisterAPIView(APIView):
    permission_classes = []
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {
                    'error': 'Username and password are required!'
                }, status=400
            )

        if Player.objects.filter(username=username).exists():
            return Response(
                {
                    'error': 'This username has already been taken!'
                }, status=400
            )
        player = Player.objects.create_user(
            username=username,
            password=password
        )
        
        return Response({'messege': 'Registeration successful'}, status=201)

# List history of finished games endpoint
class MyGamesAPIView(ListAPIView):
    serializer_class = GameSerializer

    def get_queryset(self):
        return Game.objects.filter(
            Q(creator=self.request.user) | Q(opponent=self.request.user)
        ).order_by('-id')
    
# Change personal data endpoint
class ChangePersonalDataView(APIView):

    def post(self, request, *args, **kwargs):
        user = request.user
        new_username = request.data.get('username')
        new_password = request.data.get('password')

        if new_username:
            user.username = new_username
        if new_password:
            user.set_password(new_password)

        user.save()
        return Response({'message': 'User data updated successfully.'}, status=200)
    
# List ships endpoint
class GameRulesByGameView(APIView):
    def get(self, request, game_id, *args, **kwargs):
        game = get_object_or_404(Game, id=game_id)
        difficulty = game.difficulty
        ship_rules, board_size = game.ship_rules()
        
        return Response({
            'ship_rules': ship_rules,
            'board_size': board_size
        })


# List leaderboard endpoint
class LeaderboardAPIView(ListAPIView):
    serializer_class = PlayerSerializer
    
    def get_queryset(self):
        return Player.objects.order_by('-points')[:10]
                     
# List waiting games endpoint
class WaitingGamesListView(ListAPIView):
    model = Game
    serializer_class = GameSerializer
    
    def get_queryset(self):
        current_user = self.request.user
        games = Game.objects.filter(status=0, opponent__isnull=True).exclude(creator=current_user)
        return games

        



    

    
    
        