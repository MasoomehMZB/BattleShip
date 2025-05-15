from itertools import chain
from django.db import models

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
    
    def switch_turn(self):
        if self.turn == self.creator:
            self.turn = self.opponent
        else:
            self.turn = self.creator
        self.save()
    
    def __str__(self):
        return f"Game {self.id} - {self.creator.username} vs {self.opponent.username if self.opponent else '{Waiting for opponent}'}"
    
    
class Board(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='boards')
    size = models.IntegerField(default=10)

    def save(self, *args, **kwargs):
        if self.game.difficulty == 0:  # Easy
            self.size = 10
        elif self.game.difficulty == 1:  # Medium
            self.size = 15
        elif self.game.difficulty == 2:  # Hard
            self.size = 20
        super().save(*args, **kwargs)
        

    def __str__(self):
        return f"{self.player.username}'s board for Game {self.game.id}"
    
     
    def place_ships(self, ships_data):

        ship_rules, _ = self.game.ship_rules()
        ship_count = defaultdict(int)
        occupied_cells = set()

        placed_ships = []

        for ship_data in ships_data:
            size = ship_data['size']
            start_x = ship_data['start_x']
            start_y = ship_data['start_y']
            is_vertical = ship_data.get('is_vertical', False)

            ship_count[size] += 1
            if ship_count[size] > ship_rules.get(size, 0):
                raise ValueError(f"Too many ships of size {size}")

            ship = Ship(
                size=size,
                start_x=start_x,
                start_y=start_y,
                is_vertical=is_vertical,
                board=self
            )

            if not ship.is_within_bounds():
                raise ValueError(f"Ship at ({start_x}, {start_y}) is out of bounds.")

            for cell in ship.get_occupied_cells():
                if cell in occupied_cells:
                    raise ValueError(f"Ship overlap at cell {cell}.")
                occupied_cells.add(cell)

            placed_ships.append(ship)

        for ship in placed_ships:
            ship.save()

   
class Ship(models.Model):
    # Ship sizes and their corresponding dimensions
    map_size_shape = {
        1: (0, 1),
        2: (0, 2),
        3: (0, 3),
        4: (1, 4),
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
        width, height = self.map_size_shape[self.size]
        return (height, width) if self.is_vertical else (width, height)
    
    def get_occupied_cells(self):
        width, height = self.dimensions
        return [
            (self.start_x + dx, self.start_y + dy)
            for dx in range(width)
            for dy in range(height)
        ]

    def is_within_bounds(self):
        size = self.board.size
        width, height = self.dimensions
        return self.start_x + width <= size and self.start_y + height <= size
    

    # def place_ship(self):
    #     if self.is_vertical:
    #         if self.start_y + int(self.size) > self.board.length:
    #             raise ValidationError('Ship is out of bounds.')     
    #     else:
    #         if self.start_x + int(self.size) > self.board.width:
    #             raise ValidationError('Ship is out of bounds.')

    # def check_ship_exist(self, x, y):
    #     if self.is_vertical:
    #         if y in range(self.start_y, self.start_y + int(self.size)):
    #             return True
    #     else:
    #         if x in range(self.start_x, self.start_x + int(self.size)):
    #             return True
    #     return False
        
class Shot(models.Model):
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='shots')
    shooter = models.ForeignKey(Player, related_name='shots_fired', on_delete=models.CASCADE)
    x = models.IntegerField()
    y = models.IntegerField()
    hit = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)
    
