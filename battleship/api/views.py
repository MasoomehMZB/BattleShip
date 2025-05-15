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

        serializer = ShipSerializer(data=ships_data, many=True)
        serializer.is_valid(raise_exception=True)

        try:
            board.validate_ships(serializer.validated_data)
            board.save()
            board.place_ships(serializer.validated_data)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)

        return Response({'message': 'Board populated successfully.'}, status=201)
    
    

class HitShipview(APIView):

    def post(self, request, *args, **kwargs):
        game_id = kwargs.get('game_id')
        game = get_object_or_404(Game, id=game_id)
        
        if game.turn != request.user:
            return Response({'error': 'Not your turn.'}, status=400)

        # Get opponent's board
        board = game.boards.exclude(player=request.user).first()
        if not board:
            return Response({'error': 'Opponent board not found.'}, status=404)

        # Validate shot data
        serializer = ShotSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        x = serializer.validated_data['x']
        y = serializer.validated_data['y']
        
        # Check if the shot is already taken
        if Shot.objects.filter(board=board, x=x, y=y).exists():
            return Response({'error': 'Shot already taken.'}, status=400)

        # Check if the shot is a hit
        hit = False
        hit_ship = None
        for ship in board.ships.filter(sunk=False):
            ship_width, ship_height = ship.dimensions
            x_range = range(ship.start_x, ship.start_x + ship_width)
            y_range = range(ship.start_y, ship.start_y + ship_height)
            if x in x_range and y in y_range:
                # Check if the ship is sunk
                hit_cells = 0
                for xi in x_range:
                    for yi in y_range:
                        if Shot.objects.filter(board=board, x=xi, y=yi, hit=True).exists():
                            hit_cells += 1

                if hit_cells + 1 >= ship_width * ship_height:
                    ship.sunk = True
                    ship.save()
                hit_ship = ship
                hit = True
                break
        
        # Save the shot
        Shot.objects.create(
            board=board,
            shooter=request.user,
            x=x,
            y=y,
            hit=hit
        )
        
        # Switch turn
        game.switch_turn()
        game.save()
        
        # Check if the game has ended
        game_on = board.ships.filter(sunk=False).exists()
        if not game_on:
            game.winner = request.user
            game.status = 1  # finished
            game.save()
            game_serializer = GameSerializer(game)
            
            # Update player scores
            game.winner.points += 200
            game.winner.save()
            player_serializer = PlayerSerializer(game.winner)
                
            return Response({'message': 'Game over. You won!', 'game': game_serializer.data, 'winner': player_serializer.data}, status=200)
        
        if hit_ship:
            return Response({'hit': hit, 'ship': hit_ship}, status=201)
        else:
            return Response({'hit': hit}, status=201)

# Acount data endpoint
class AccountDataView(APIView):
    def get(self, request, *args, **kwargs):
        user = request.user
        player = Player.objects.get(username=user.username)
        serializer = PlayerSerializer(player)
        return Response(serializer.data, status=200)
    
# Register endpoint
class RegisterAPIView(APIView):
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

        



    

    
    
        