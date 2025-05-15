from django.contrib import admin
from main.models import Board, Player, Game, Ship, Shot

admin.site.register(Player)
admin.site.register(Game)
admin.site.register(Ship)
admin.site.register(Shot)
admin.site.register(Board)

