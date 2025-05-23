# Battleship API Documentation

This document describes the API endpoints available in the Battleship game backend. The endpoints are presented in the order a user would typically interact with them when starting and playing a game.

---

## Register a New User

**Endpoint:** `POST /register/`

**Description:** Register a new player account.

**Input:**
- `username` (string, required)
- `password` (string, required)

**Output:**
- Success: `{ "messege": "Registeration successful" }` (201 Created)
- Error: `{ "error": "Username and password are required!" }` (400 Bad Request)
- Error: `{ "error": "This username has already been taken!" }` (400 Bad Request)

**Validations/Restrictions:**
- Both username and password must be provided.
- Username must be unique.

---

## Login

**Endpoint:** `POST /login/`

**Description:** Authenticate a user and obtain an access token.

**Input:**
- `username` (string, required)
- `password` (string, required)

**Output:**
- Success: `{ "token": "<access_token>" }` (200 OK)
- Error: `{ "error": "Invalid credentials." }` (401 Unauthorized)

**Validations/Restrictions:**
- Both username and password must be provided.
- Credentials must be valid.

---
## Get Account Data

**Endpoint:** `GET /account/`

**Description:** Retrieve the authenticated user's player data.

**Output:**
- `username` (string)
- `level` (string)
- `points` (integer)
- `total_games` (integer)


---

## Create a New Game

**Endpoint:** `POST /games/`

**Description:** Create a new game. The authenticated user becomes the creator.

**Input:**
Request body: JSON object with the following field:
- `difficulty` (integer, required): 0 for easy, 1 for medium, 2 for hard, 3 for dummy

**Output:**
- Success: Game data including:
  - `id` (integer)
  - `creator` (string, username)
  - `opponent` (string or null)
  - `difficulty` (string, e.g. "Easy", "Medium", "Hard", "Dummy")
  - `status` (string, e.g. "Waiting")
  - `winner` (string or null)
  - `turn` (string or null)
  - `created_at` (datetime)
- Error: `{ "error": "You have already joined a game." }` (400 Bad Request)

**Validations/Restrictions:**
- User cannot create a new game if they have an unfinished game (either created or competed in).

---

## Join an Existing Game

**Endpoint:** `POST /games/{game_id}/join/`

**Description:** Join a waiting game as the opponent.

**Input:**
- URL parameter: `game_id` (integer)

**Output:**
- Success: `{ "message": "Game joined successfully." }` (200 OK)
- Error: `{ "error": "Game is already full." }` (400 Bad Request)
- Error: `{ "error": "You have already joined a game." }` (400 Bad Request)
- Error: `{ "error": "You cannot join your own game." }` (400 Bad Request)

**Validations/Restrictions:**
- Game must be in waiting status (`status == 0`).
- User cannot join if they already have an unfinished game.
- User cannot join their own game.

---

## Get Game Rules by Game

**Endpoint:** `GET /games/{game_id}/rules/`

**Description:** Get ship rules and board size for a specific game.

**Output:**
- `{ "ship_rules": <rules>, "board_size": <size> }` (200 OK)

---

## Arrange Board (Place Ships)

**Endpoint:** `POST /games/{game_id}/arrange-board/`

**Description:** Arrange ships on the board for the game.

**Input:**
- URL parameter: `game_id` (integer)
- Request body: JSON object with key `ships` containing a list of ships to place. Each ship object includes:
  - `size` (integer, required)
  - `start_x` (integer, required)
  - `start_y` (integer, required)
  - `is_vertical` (boolean, optional, default false)

Example:
```json
{
  "ships": [
    {"size": 5, "start_x": 0, "start_y": 0, "is_vertical": false},
    {"size": 4, "start_x": 2, "start_y": 3, "is_vertical": true}
  ]
}
```

**Output:**
- Success: `{ "message": "Board populated successfully." }` (201 Created)
- Error: `{ "error": "You are not a player in this game." }` (403 Forbidden)
- Error: `{ "error": "Game is not in the setup phase." }` (400 Bad Request)
- Error: `{ "error": "You have already arranged your board." }` (400 Bad Request)
- Error: `{ "error": "No ships provided." }` (400 Bad Request)
- Error: `{ "error": "<validation error message>" }` (400 Bad Request)

**Validations/Restrictions:**
- User must be a player in the game (creator or opponent).
- Game must be in progress status (`status == 2`).
- User cannot arrange board more than once.
- Ships must be provided and valid according to board rules.

---

## Get Board Ships

**Endpoint:** `GET /games/{game_id}/board-ships/`

**Description:** Retrieve the list of ships placed on the authenticated user's board for a specific game.

**Input:**
- URL parameter: `game_id` (integer)

**Output:**
- List of ships with fields:
  - `id` (integer)
  - `size` (integer)
  - `start_x` (integer)
  - `start_y` (integer)
  - `is_vertical` (boolean)
  - `sunk` (boolean)

---

## Hit (Make a Move)

**Endpoint:** `POST /games/{game_id}/hit/`

**Description:** Make a shot at the opponent's board.

**Input:**
- URL parameter: `game_id` (integer)
- Request body: JSON object with the following fields:
  - `x` (integer, required)
  - `y` (integer, required)

**Output:**
- Success: `{ "hit": true/false, "ship": <ship data or null> }` (201 Created)
- Game Over: `{ "message": "Game over. You won!", "game": <game data>, "winner": <player data> }` (200 OK)
- Error: `{ "error": "Not your turn." }` (400 Bad Request)
- Error: `{ "error": "You are not a player in this game." }` (403 Forbidden)
- Error: `{ "error": "Opponent board not found." }` (404 Not Found)
- Error: `{ "error": "<validation error message>" }` (400 Bad Request)

**Validations/Restrictions:**
- Game must be in in progress status (`status == 2`).
- It must be the user's turn.
- User must be a player in the game.
- Shot coordinates must be valid and not previously targeted.

---

## Surrender Game

**Endpoint:** `GET /games/{game_id}/surrender/`

**Description:** Surrender the current game, making the opponent the winner.

**Input:**
- URL parameter: `game_id` (integer)

**Output:**
- Success: `{ "message": "Game over. You won!", "game": <game data>, "winner": <player data> }` (200 OK)
- Error: `{ "error": "Not your turn." }` (400 Bad Request)
- Error: `{ "error": "You are not a player in this game." }` (403 Forbidden)
- Error: `{ "error": "Game is already finished." }` (400 Bad Request)

**Validations/Restrictions:**
- Game must be in in progress status (`status == 2`).
- It must be the user's turn.
- User must be a player in the game.
- Game must not be already finished.


---

## Additional Endpoints

## List Finished Games

**Endpoint:** `GET /my-games/`

**Description:** List all finished games involving the authenticated user.

**Output:**
- List of games with fields:
  - `id` (integer)
  - `creator` (string)
  - `opponent` (string or null)
  - `difficulty` (string)
  - `status` (string)
  - `winner` (string or null)
  - `turn` (string or null)
  - `created_at` (datetime)

---

## Change Personal Data

**Endpoint:** `POST /change-personal-data/`

**Description:** Change username and/or password.

**Input:**
- `username` (string, optional)
- `password` (string, optional)

**Output:**
- `{ "message": "User data updated successfully." }` (200 OK)

---

## List Leaderboard

**Endpoint:** `GET /leaderboard/`

**Description:** List top 10 players ordered by points.

**Output:**
- List of players with fields:
  - `username` (string)
  - `level` (string)
  - `points` (integer)
  - `total_games` (integer)

---

## List Waiting Games

**Endpoint:** `GET /waiting-games/`

**Description:** List games waiting for an opponent, excluding those created by the current user.

**Output:**
- List of games with fields:
  - `id` (integer)
  - `creator` (string)
  - `opponent` (string or null)
  - `difficulty` (string)
  - `status` (string)
  - `winner` (string or null)
  - `turn` (string or null)
  - `created_at` (datetime)

---

# Notes

- All endpoints require authentication except the registration endpoint.
- Status codes:
  - `0` = waiting for opponent
  - `1` = finished
  - `2` = in progress
- The user can only have one unfinished game at a time.
- The game creator cannot join their own game.
- Board arrangement must be done once per player per game.
- Turns alternate after each hit until a winner is determined.


