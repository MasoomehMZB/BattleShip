import operator
from functools import reduce
from django.db import models
from django.db.models import Q

from collections import defaultdict

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator


class Player(AbstractUser):
    total_games = models.IntegerField(default=0)
    #total_wins = models.IntegerField(default=0)
    points = models.IntegerField(default=0)
    level = models.CharField(max_length=20, blank=True)
    
    
    class Meta:
        verbose_name = 'Player'
        verbose_name_plural = 'Players'

    def save(self, *args, **kwargs):
        if self.points < 2000:
            self.level = 'Beginner'
        elif self.points < 4000:
            self.level = 'Intermediate'
        else:
            self.level = 'Expert'
        super().save(*args, **kwargs)
        
        
class Game(models.Model):
  
    GAME_DIFF=(
        (0, 'Easy'),
        (1, 'Medium'),
        (2, 'Hard'),
        (3, 'Dummy'),
    )
    
    GAME_STATUS=(
        (0, 'Waiting'),
        (1, 'Finished'),
        (2, 'In Progress'),
    )
    
    creator = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='games_created')
    opponent = models.ForeignKey(Player, on_delete=models.SET_NULL, related_name='games_competed', null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    difficulty = models.IntegerField(choices=GAME_DIFF)
    status = models.IntegerField(choices=GAME_STATUS)
    winner = models.ForeignKey(Player, on_delete=models.SET_NULL, related_name='won_games', null=True, blank=True)
    turn = models.ForeignKey(Player, on_delete=models.SET_NULL, related_name='turn_games', null=True, blank=True)
    
    def get_opponent_board(self, user):
        return self.boards.exclude(player=user).first()

    def ship_rules(self):
        if self.difficulty == 0:  # Easy
            # {Ship size: count}, board size 
            return {
                1: 1,
                2: 2,
                3: 1,
                4: 1,
            }, 10
        elif self.difficulty == 1:  # Medium
            return {
                1: 1,
                2: 2,
                3: 2,
                4: 1,
                5: 1,
            }, 15
        elif self.difficulty == 2:  # Hard
            return {
                1: 1,
                2: 2,
                3: 2,
                4: 2,
                5: 1,
                6: 1,
            }, 20
        elif self.difficulty == 3:  # Dummy
            return {
                1: 1,
                2: 1,
            }, 3
    
    def switch_turn(self):
        if self.turn == self.creator:
            self.turn = self.opponent
        else:
            self.turn = self.creator
        self.save()
    
    def set_winner(self, player):
        self.winner = player
        self.status = 1  # finished
        self.save()
        player.points += 200
        player.save()
    
    def __str__(self):
        return f"Game {self.id} - {self.creator.username} vs {self.opponent.username if self.opponent else '{Waiting for opponent}'}"
    
    
class Board(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='boards')
    size = models.IntegerField()

    def set_size(self):
        if self.game.difficulty == 0:  # Easy
            self.size = 10
        elif self.game.difficulty == 1:  # Medium
            self.size = 15
        elif self.game.difficulty == 2:  # Hard
            self.size = 20
        elif self.game.difficulty == 3:  # Dummy
            self.size = 3
        

    def __str__(self):
        return f"{self.player.username}'s board for Game {self.game.id}"
    
    def validate_ships(self, ships_data):
        ship_rules, _ = self.game.ship_rules()
        ship_count = defaultdict(int)
        occupied_cells = set()

        for ship_data in ships_data:
            size = ship_data['size']
            start_x = ship_data['start_x']
            start_y = ship_data['start_y']
            is_vertical = ship_data.get('is_vertical', False)

            ship_count[size] += 1
            if ship_count[size] > ship_rules.get(size, 0):
                raise ValueError(f"Too many ships of size {size}")

            temp_ship = Ship(
                size=size,
                start_x=start_x,
                start_y=start_y,
                is_vertical=is_vertical,
                board=self 
            )

            if not temp_ship.is_within_bounds():
                raise ValueError(f"Ship at ({start_x}, {start_y}) is out of bounds.")

            for cell in temp_ship.get_occupied_cells():
                if cell in occupied_cells:
                    raise ValueError(f"Ship overlap at cell {cell}.")
                occupied_cells.add(cell)
     
    def place_ships(self, ships_data):
        for data in ships_data:
            Ship.create_from_data(self, data)
    
    def register_hit(self, x, y):
        # Check if the shot is a hit
        hit = False
        hit_ship = None
        for ship in self.ships.filter(sunk=False):
            occupied_cells = ship.get_occupied_cells()
            if (x, y) in occupied_cells:
                hit = True
                # Count hits so far
                hit_cells = Shot.objects.filter(board=self, hit=True).filter(
                    reduce(operator.or_, [Q(x=x, y=y) for (x, y) in occupied_cells])).count()

                if hit_cells + 1 >= len(occupied_cells):
                    ship.sunk = True
                    ship.save()
                    
                hit_ship = ship
                return hit, hit_ship
        return hit, hit_ship

    
    def validate_shot(self, x, y):
        if x < 0 or x >= self.size or y < 0 or y >= self.size:
            raise ValueError("Shot out of bounds.")
        if Shot.objects.filter(board=self, x=x, y=y).exists():
            raise ValueError("Shot already taken.")
    
    def all_ships_sunk(self):
        return not self.ships.filter(sunk=False).exists()
   
class Ship(models.Model):
    # Ship sizes and their corresponding dimensions
    map_size_to_shape = {
        1: (0, 1),
        2: (0, 2),
        3: (0, 3),
        4: (0, 4),
        5: (1, 5),
        6: (1, 6),
    }
    
    is_vertical = models.BooleanField(default=False)
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='ships')
    size = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(6)])
    start_x = models.PositiveIntegerField()
    start_y = models.PositiveIntegerField()
    sunk = models.BooleanField(default=False)
    
    @property
    def dimensions(self):
        # Returns (width, height) depending on orientation
        width, height = self.map_size_to_shape[self.size]
        return (height, width) if self.is_vertical else (width, height)
    
    def get_occupied_cells(self):
        width, height = self.dimensions
        return [(self.start_x + dx, self.start_y + dy) for dx in range(width + 1) for dy in range(height + 1)]

    def is_within_bounds(self):
        board_size = self.board.size - 1
        width, height = self.dimensions
        return self.start_x + width <= board_size and self.start_y + height <= board_size

    @classmethod
    def create_from_data(cls, board, ship_data):
        return cls.objects.create(
        board=board,
        size=ship_data['size'],
        start_x=ship_data['start_x'],
        start_y=ship_data['start_y'],
        is_vertical=ship_data.get('is_vertical', False),
        )
    
    def __str__(self):
        return f"Ship of size {self.size} at ({self.start_x}, {self.start_y}) for Game {self.board.game.id}"

        
class Shot(models.Model):
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='shots')
    shooter = models.ForeignKey(Player, related_name='shots_fired', on_delete=models.CASCADE)
    x = models.IntegerField()
    y = models.IntegerField()
    hit = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)
    
