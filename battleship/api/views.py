# Django imports
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
    model = Game
    serializer_class = GameSerializer
    
    def perform_create(self, serializer):
        game = serializer.save()
        game.creator = self.request.user
        game.status = 0
        game.save()
        return game


class JoinGameView(APIView):

    def post(self, request, *args, **kwargs):
        game_id = kwargs.get('game_id')
        game = get_object_or_404(Game, id=game_id)
        
        if game.status != 0:  # status is integer field, 0 means Waiting
                return Response({'error': 'Game is not available.'}, status=400)
            
        if game.opponent:
            return Response({'error': 'Game is already full.'}, status=400)
        
        if game.creator == request.user:
            return Response({'error': 'You cannot join your own game.'}, status=400)
        
        game.opponent = request.user
        game.status = 2  # in_progress
        game.save()
        return Response({'message': 'Game joined successfully.'}, status=200)


class ArrangeBoardView(APIView):
    def post(self, request, *args, **kwargs):
        game_id = kwargs.get('game_id')
        game = get_object_or_404(Game, id=game_id)

        ships_data = request.data.get('ships', [])
        if not ships_data:
            return Response({'error': 'No ships provided.'}, status=400)

        # Create the board for the player
        board = Board.objects.create(player=request.user, game=game)

        # Validate ships
        serializer = ShipSerializer(data=ships_data, many=True)
        serializer.is_valid(raise_exception=True)
        
        # Check if the ships are valid in game difficulty
        ship_rules, _ = game.ship_rules()
        if not all(ship_data['size'] in ship_rules for ship_data in serializer.validated_data):
            return Response({'error': 'Invalid ship sizes for the game difficulty.'}, status=400)

        occupied_cells = set()

        for ship_data in serializer.validated_data:
            size = ship_data['size']
            start_x = ship_data['start_x']
            start_y = ship_data['start_y']
            is_vertical = ship_data.get('is_vertical', False)

            # Create a temporary Ship instance (not saved)
            temp_ship = Ship(
                size=size,
                start_x=start_x,
                start_y=start_y,
                is_vertical=is_vertical,
                board=board  # needed for FK; we can use it now since it's created
            )

            if not temp_ship.is_within_bounds():
                return Response({
                    'error': f'Ship at ({start_x}, {start_y}) is out of bounds.'
                }, status=400)

            for cell in temp_ship.get_occupied_cells():
                if cell in occupied_cells:
                    return Response({
                        'error': f'Ship overlap at cell {cell}.' 
                    }, status=400)
                occupied_cells.add(cell)

            # Save valid ship
            temp_ship.save()

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

# Logout endpoint
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
        
        serilized_player = PlayerSerializer(player)

        return Response(serilized_player.data, status=201)

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

        



    

    
    
        