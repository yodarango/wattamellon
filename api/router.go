package api

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"text/template"
)

func Router () *http.ServeMux{

	mux := http.NewServeMux()

	// PUBLIC
	mux.Handle("/public/", http.StripPrefix("/public/", http.FileServer(http.Dir("public"))))

	// POST
	mux.HandleFunc("/new-game", NewGame)
	// POST
	mux.HandleFunc("/complete-game", CompleteGame)
	// POST
	mux.HandleFunc("/new-game-session", NewGameSession)
	// UPDATE
	mux.HandleFunc("/submit-game-session", SubmitGameSession)
	// GET
	mux.HandleFunc("/", GetHomePage)
	// GET
	mux.HandleFunc("/play/", GetPlayPage) // where the last item is the id of the game session
	// GET
	mux.HandleFunc("/view/", GetViewPage) // where the last item is the id of the actual game


	return mux
}

type Game struct {
	ID           int       `json:"id"`
	Name         string    `json:"name"`
	PlayerName   string    `json:"player_name"`
	Size         int       `json:"size"`
	CreatorToken string    `json:"creator_token"`
	Questions    string   `json:"questions"`
	Thumbnail string 	     `json:"thumbnail"`
	Created      string    `json:"created"`
	IsCompleted  bool      `json:"is_completed"`
}

// FloatToInt è un tipo personalizzato che può accettare sia numeri interi che decimali
// durante l'unmarshalling JSON, convertendoli in int
type FloatToInt int

// UnmarshalJSON implementa l'interfaccia json.Unmarshaler
func (fi *FloatToInt) UnmarshalJSON(data []byte) error {
	var floatValue float64
	if err := json.Unmarshal(data, &floatValue); err == nil {
		*fi = FloatToInt(int(floatValue))
		return nil
	}

	var intValue int
	if err := json.Unmarshal(data, &intValue); err != nil {
		return err
	}

	*fi = FloatToInt(intValue)
	return nil
}

type GameSession struct {
	ID          int         `json:"id"`
	GameID      int         `json:"game_id"`
	PlayerToken string      `json:"player_token"`
	Answers     string      `json:"answers"`
	IsCompleted bool        `json:"is_completed"`
	SuccessRate FloatToInt  `json:"success_rate"`
	PlayerName  string      `json:"player_name"`
	Created     string      `json:"created"`
}

type HttpResponse struct{
	Data interface{} `json:"data"`
	Success bool `json:"success"`
	Error string `json:"error"`
}

func NewGame(w http.ResponseWriter, r *http.Request){

	var response HttpResponse
	var game Game

	w.Header().Set("Content-Type", "application/json")

	buffer, err := io.ReadAll(r.Body)

	if err != nil {
		response.Error = fmt.Sprintf("error reading buffer %v", err)
		response.Success = false
		response.Data = nil

		json.NewEncoder(w).Encode(response)
		fmt.Println("Could not bufferize body" ,err)
		return
	}

	defer r.Body.Close()

	err = json.Unmarshal(buffer, &game)

	if err != nil {
		response.Error = fmt.Sprintf("error unmarshalling buffer %v", err)
		response.Success = false
		response.Data = nil

		json.NewEncoder(w).Encode(response)
		fmt.Printf("could not unmarshall body %v" ,err)
		return
	}

	query := `
		INSERT INTO games (
			name, player_name, size, thumbnail, creator_token, questions
		)
		VALUES(?,?,?,?,?,?);
	`

	result, err := RouterConfig.DB.Conn.Exec(query, game.Name, game.PlayerName, game.Size, game.Thumbnail, game.CreatorToken, game.Questions)

	if err != nil {
		response.Error = fmt.Sprintf("error creating game %v", err)
		response.Success = false
		response.Data = nil

		json.NewEncoder(w).Encode(response)
		fmt.Println("Could not create game" ,err)
		return
	}

	lastId, _ := result.LastInsertId()


	game.ID = int(lastId)

	response.Success = true
	response.Data = game
	response.Error = ""

	json.NewEncoder(w).Encode(response)
}

func CompleteGame(w http.ResponseWriter, r *http.Request){

	var response HttpResponse
	var game Game

	w.Header().Set("Content-Type", "application/json")

	buffer, err := io.ReadAll(r.Body)

	if err != nil {
		response.Error = fmt.Sprintf("error reading buffer %v", err)
		response.Success = false
		response.Data = nil

		json.NewEncoder(w).Encode(response)
		fmt.Println("Could not bufferize body" ,err)
		return
	}

	defer r.Body.Close()

	err = json.Unmarshal(buffer, &game)

	if err != nil {
		response.Error = fmt.Sprintf("error unmarshalling buffer %v", err)
		response.Success = false
		response.Data = nil

		json.NewEncoder(w).Encode(response)
		fmt.Printf("could not unmarshall body %v" ,err)
		return
	}

	query := `
		UPDATE games set questions = ?, is_complete = true WHERE id = ?;
	`

	_, err = RouterConfig.DB.Conn.Exec(query, game.Questions, game.ID)

	if err != nil {
		response.Error = fmt.Sprintf("error creating game %v", err)
		response.Success = false
		response.Data = nil

		json.NewEncoder(w).Encode(response)
		fmt.Println("Could not create game" ,err)
		return
	}

	response.Success = true
	response.Data = game
	response.Error = ""

	json.NewEncoder(w).Encode(response)
}

func NewGameSession(w http.ResponseWriter, r *http.Request) {
	var response HttpResponse
	var gameSession GameSession

	w.Header().Set("Content-Type", "application/json")

	buffer, err := io.ReadAll(r.Body)

	if err != nil {
		response.Error = fmt.Sprintf("error reading buffer %v", err)
		response.Success = false
		response.Data = nil

		json.NewEncoder(w).Encode(response)
		fmt.Println("Could not bufferize body" ,err)
		return
	}

	defer r.Body.Close()

	err = json.Unmarshal(buffer, &gameSession)

	if err != nil {
		response.Error = fmt.Sprintf("error unmarshalling buffer %v", err)
		response.Success = false
		response.Data = nil

		json.NewEncoder(w).Encode(response)
		fmt.Println("Could not unmarshall body" ,err)
		return
	}

	query := `
		INSERT INTO game_sessions (
			game_id, player_token, answers, player_name
		)
		VALUES(?,?,?,?);
	`

	result, err := RouterConfig.DB.Conn.Exec(query, gameSession.GameID, gameSession.PlayerToken, gameSession.Answers, gameSession.PlayerName)

	if err != nil {
		response.Error = fmt.Sprintf("error creating game %v", err)
		response.Success = false
		response.Data = nil

		json.NewEncoder(w).Encode(response)
		fmt.Println("Could not create game" ,err)
		return
	}

	lastId, _ := result.LastInsertId()


	gameSession.ID = int(lastId)

	response.Success = true
	response.Data = gameSession
	response.Error = ""

	json.NewEncoder(w).Encode(response)
}

func SubmitGameSession(w http.ResponseWriter, r *http.Request) {
	var response HttpResponse
	var gameSession GameSession

	w.Header().Set("Content-Type", "application/json")

	buffer, err := io.ReadAll(r.Body)

	if err != nil {
		response.Error = fmt.Sprintf("error reading buffer %v", err)
		response.Success = false
		response.Data = nil

		json.NewEncoder(w).Encode(response)
		fmt.Println("Could not bufferize body" ,err)
		return
	}

	defer r.Body.Close()

	err = json.Unmarshal(buffer, &gameSession)

	if err != nil {
		response.Error = fmt.Sprintf("error unmarshalling buffer %v", err)
		response.Success = false
		response.Data = nil

		json.NewEncoder(w).Encode(response)
		fmt.Println("Could not unmarshall body" ,err)
		return
	}

	query := `
		UPDATE game_sessions
		SET is_completed = true, success_rate = ?, answers = ?
		WHERE id = ? AND player_token = ? ;
	`

	_, err = RouterConfig.DB.Conn.Exec(query, int(gameSession.SuccessRate), gameSession.Answers, gameSession.ID, gameSession.PlayerToken)

	if err != nil {
		response.Error = fmt.Sprintf("error creating game %v", err)
		response.Success = false
		response.Data = nil

		json.NewEncoder(w).Encode(response)
		fmt.Println("Could not create game" ,err)
		return
	}

	response.Success = true
	response.Data = gameSession
	response.Error = ""

	json.NewEncoder(w).Encode(response)
}

// Renders index.html, the home page
// this is the page where the user can create a new game
func GetHomePage(w http.ResponseWriter, r *http.Request){
	// Get the user token from the cookie
	var lastGame Game
	var response HttpResponse

	userToken, err := r.Cookie("player_token")
	if err == nil && userToken.Value != "" {
		// Query the database for the last game created by this user
		query := `SELECT id, name, player_name, size, thumbnail, creator_token, questions, created, is_complete
				  FROM games
				  WHERE creator_token = ?
				  ORDER BY created DESC
				  LIMIT 1;`

		err := RouterConfig.DB.Conn.QueryRow(query, userToken.Value).Scan(
			&lastGame.ID,
			&lastGame.Name,
			&lastGame.PlayerName,
			&lastGame.Size,
			&lastGame.Thumbnail,
			&lastGame.CreatorToken,
			&lastGame.Questions,
			&lastGame.Created,
			&lastGame.IsCompleted,
		)

		if err != nil {
			fmt.Printf("No rows found: %v", err)
		}

		// lets go ahead and also send the data as a string to the template since it is much easier for JS to consume it

		lastGameJson, err := json.Marshal(lastGame)
		if err != nil {
			fmt.Printf("error marshalling game %v", err)
		}

		if err == nil {
			response.Data = map[string]interface{}{
				"LastGameJson": string(lastGameJson),
				"LastGame": lastGame,
			}
			response.Success = true
			response.Error = ""
		}
	}


	// Parse the template files
	temp, err := template.ParseFiles("internal/views/index.html", "internal/views/_head.html", "internal/views/_footer.html")
	if err != nil {
		fmt.Println("Unable to parse file:", err)
		return
	}

	// Execute the template with the data
	err = temp.Execute(w, response.Data)
	if err != nil {
		fmt.Println("Unable to execute file:", err)
	}
}

// Renders play.htmt, the user is playig the game
func GetPlayPage(w http.ResponseWriter, r *http.Request) {
	var response HttpResponse
	var gameSession GameSession
	var game Game

	path := strings.Split(r.URL.Path, "/")
	gameId := path[len(path) - 1]

	playerToken, err := r.Cookie("player_token")

	// Default to empty string if cookie is not present
	playerTokenValue := ""
	if err == nil && playerToken != nil {
		playerTokenValue = playerToken.Value
	} else {
		fmt.Println("Could not get user token", err)
	}

	// w.Header().Set("Content-Type", "application/json")

	query := `SELECT id, game_id, player_token, answers, is_completed, success_rate, created FROM game_sessions WHERE game_id = ? AND player_token = ? ORDER BY ID DESC LIMIT 1;`

	row := RouterConfig.DB.Conn.QueryRow(query, gameId, playerTokenValue)

	err = row.Scan(
		&gameSession.ID,
		&gameSession.GameID,
		&gameSession.PlayerToken,
		&gameSession.Answers,
		&gameSession.IsCompleted,
		&gameSession.SuccessRate,
		&gameSession.Created)

	if err != nil && err != sql.ErrNoRows {
		response.Error = fmt.Sprintf("error getting game %v", err)
		response.Success = false
		response.Data = nil

		json.NewEncoder(w).Encode(response)
		fmt.Println("Could not create game" ,err)
		return
	}

	row = RouterConfig.DB.Conn.QueryRow(`SELECT id, name, player_name, thumbnail, creator_token, questions FROM games WHERE id = ?;`, gameId)

	err = row.Scan(
		&game.ID,
		&game.Name,
		&game.PlayerName,
		&game.Thumbnail,
		&game.CreatorToken,
		&game.Questions,
	)

	if err != nil {
		fmt.Println("Could not get game", err)
		response.Error = fmt.Sprintf("error getting game %v", err)
		response.Success = false
		response.Data = nil
		return
	}

	var sessionJson []byte
	if gameSession.ID != 0 {
		sessionJson, err = json.Marshal(gameSession)
		if err != nil {
			fmt.Printf("error marshalling game %v", err)
		}
	}

	response.Success = true
	response.Data = map[string]interface{}{
		"SessionJson": string(sessionJson),
		"Session": gameSession,
		"Game": game,
	}
	response.Error = ""

	// uncoment if i decide to make it an API
	// json.NewEncoder(w).Encode(response)

	temp, err := template.ParseFiles("internal/views/play.html", "internal/views/_head.html", "internal/views/_footer.html")

	if err != nil {
		fmt.Println("Unable to parse file")
	}

	err = temp.Execute(w, response.Data)

	if err != nil {
		fmt.Println("Unable to execute file")
	}
}

func GetViewPage(w http.ResponseWriter, r *http.Request) {
	var response HttpResponse
	var game Game

	path := strings.Split(r.URL.Path, "/")
	gameId := path[len(path) - 1]

	// w.Header().Set("Content-Type", "application/json")

	userToken, err := r.Cookie("player_token")

	// Default to empty string if cookie is not present
	userTokenValue := ""
	if err == nil && userToken != nil {
		userTokenValue = userToken.Value
	} else {
		fmt.Println("Could not get user token", err)
	}

	// users are limited to see their own games, fetch the creator token from this game
	// to compare it with the user token requeting the game
	queryForCreatorToken := `SELECT creator_token FROM games WHERE id = ?;`
	row := RouterConfig.DB.Conn.QueryRow(queryForCreatorToken, gameId)

	var originalCreatorToken string

	err = row.Scan(&originalCreatorToken)

	if err != nil {
		fmt.Println("Could not get game", err)
	}

	isAllowedToSeeThisGameId := userTokenValue == originalCreatorToken

	queryForGame := `SELECT id, name, player_name, size, thumbnail, creator_token, questions, created, is_complete FROM games WHERE id = ?;`
	queryFieldId := gameId

	if (!isAllowedToSeeThisGameId) {
		queryForGame = `SELECT id, name, player_name, size, thumbnail, creator_token, questions, created, is_complete FROM games WHERE creator_token = ? ORDER BY ID DESC LIMIT 1;`

		queryFieldId = userTokenValue
	}

	row = RouterConfig.DB.Conn.QueryRow(queryForGame, queryFieldId)

	err = row.Scan(
		&game.ID,
		&game.Name,
		&game.PlayerName,
		&game.Size,
		&game.Thumbnail,
		&game.CreatorToken,
		&game.Questions,
		&game.Created,
		&game.IsCompleted)

	if err != nil {
		fmt.Println("Could not get game", err)
		response.Error = fmt.Sprintf("error getting game %v", err)
		response.Success = false
		response.Data = nil
	}

	queryForGameSessions := `SELECT id, game_id, player_token, player_name, answers, is_completed, success_rate, created FROM game_sessions WHERE game_id = ?;`

	rows, err := RouterConfig.DB.Conn.Query(queryForGameSessions, game.ID)

	if err != nil {
		response.Error = fmt.Sprintf("error getting game %v", err)
		response.Success = false
		response.Data = nil

		json.NewEncoder(w).Encode(response)
		fmt.Println("Could not get game" ,err)
	}

	defer rows.Close()

	gameSessions := make([]GameSession, 0)

	for rows.Next() {
		var gameSession GameSession

		err := rows.Scan(
		&gameSession.ID,
		&gameSession.GameID,
		&gameSession.PlayerToken,
		&gameSession.PlayerName,
		&gameSession.Answers,
		&gameSession.IsCompleted,
		&gameSession.SuccessRate,
		&gameSession.Created)

		if err != nil {
			response.Error = fmt.Sprintf("error getting game %v", err)
			response.Success = false
			response.Data = nil

			json.NewEncoder(w).Encode(response)
			fmt.Println("Could not create game" ,err)
			return
		}

		gameSessions = append(gameSessions, gameSession)
	}



	response.Data = map[string]interface{}{
		"Sessions": gameSessions,
		"Game": game,
	}

	response.Success = true
	response.Error = ""

	// uncoment if i decide to make it an API
	// json.NewEncoder(w).Encode(response)

	// add the response to the template
	temp, err := template.ParseFiles("internal/views/view.html", "internal/views/_head.html", "internal/views/_footer.html")

	if err != nil {
		fmt.Println("Unable to parse file", err)
	}

	err = temp.Execute(w, response.Data)

	if err != nil {
		fmt.Println("Unable to execute file", err)
	}
}