# Wattamellon 🍉

## ABOUT

Wattamellon is the ultimate friendship test — a "this or that" quiz game where users create personalized quizzes about themselves and share them with friends to see who knows them best.

### How It Works

1. **Create a Game**: Users create a new game by providing a name and answering a series of "this or that" preference questions (e.g., "Coffee or Tea?", "Beach or Mountains?").

2. **Share with Friends**: Once completed, the game generates a shareable link that users can send to friends and family.

3. **Test Your Friends**: Friends answer the same questions, trying to match the creator's preferences.

4. **See Results**: The app calculates a success rate based on how well friends know the creator, with scores ranging from 0-100%.

5. **Compare Results**: Users can view an accordion-style UI showing which questions friends answered correctly or incorrectly.

The application uses local storage to maintain game state during creation and MySQL database to store completed games and sessions. Each user gets a unique token for identification, allowing the system to track game creators and players.

## DEV

### Tech Stack

- **Backend**: Go (v1.22)

  - Standard library HTTP server
  - MySQL driver (github.com/go-sql-driver/mysql)
  - godotenv for environment variables

- **Frontend**:

  - Vanilla JavaScript
  - HTML/CSS
  - Template rendering with Go's text/template package
  - External CSS from cdn.danielrangel.net/fullds.min.css
  - Ionicons for icons

- **Database**:

  - MySQL 8.0
  - Two main tables: games and game_sessions

- **Deployment**:
  - Docker and Docker Compose
  - Ubuntu 20.04 production environment
  - Systemd service for production

### Development Setup

1. Clone the repository
2. Create a `.env` file with the following variables:
   ```
   ENV=DEV
   WEB_PORT=8008
   DB_HOST=wattamellon_mysql
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=wattamellon
   DB_PORT=3306
   MYSQL_DOCKER_PORT=3306
   MYSQL_ROOT_PASSWORD=your_password
   MYSQL_DATABASE=wattamellon
   COMPOSE_PROJECT_NAME=wattamellon_app
   ```
3. Start the development environment:

   ```
   docker compose up
   ```

   This will start both the application in development mode (with hot reloading) and the MySQL database.

4. For database-only development, use:
   ```
   docker compose -f ./docker-compose.db.yml --env-file ./.env up -d
   ```

### Project Structure

- `/api`: API routes and handlers
- `/cmd/main`: Application entry point
- `/config`: Application configuration
- `/internal`: Internal packages
  - `/db`: Database connection and migrations
  - `/views`: HTML templates
- `/public`: Static assets (CSS, JS, images)
- `/repo`: Repository pattern implementation

### Deployment Process

1. Build the binary for Ubuntu 20.04:

   ```
   GOOS=linux GOARCH=amd64 go build -o wattamellon ./cmd/main/main.go
   ```

2. Use the `deploy.sh` script with a commit message:

   ```
   ./deploy.sh "Your commit message"
   ```

   The script will:

   - Build the binary
   - Commit and push changes to Git
   - SSH into the production server
   - Pull the latest changes
   - Restart only the database container
   - Restart the systemd service

3. In production, the application runs as a systemd service (`wattamellon_shrood_app.service`) and uses the compiled binary instead of the development mode.

## TODO

- Allow users to edit games
- Allow users to SOFT delete games
- Do not allow users to play their own games
- Maybe add a way to reset the game so if users do not like the set of questions they get
- When the user creates a new game the questions selected are not saved in the db. Save them initially even if they are empty.
- Do not allow users to play games that are not complete
- Do not allow orphan games/sessions. Right now if a user creates a game/session and does not complete it and then the local storage is cleared, the game/session will be lost even if they have the same user token because the game/session are only saved to the LS onload if they are completed, otherwise the app assumes they already exist in the web browser data
- The view/:id renders even for non-existing games, it should not
- Header needs some help
