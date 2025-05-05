package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"wattamellon/api"
	"wattamellon/config"
	"wattamellon/internal/db"
	"wattamellon/repo"

	"github.com/joho/godotenv"
)

func main(){

	// start the db connection
	conn, err := db.DBConnection()

	if err != nil {
		panic(err)
	}

	dbConn := db.NewDBConnection(conn)

	// set up the app config
	// Try to load .env file, but don't fail if it doesn't exist
	// This is useful in containerized environments where env vars are passed directly
	_ = godotenv.Load()

	env := os.Getenv("ENV")
	port := os.Getenv("WEB_PORT")

	appConfig := config.NewAppConfig(env)

	// now that I have both the db connection and the app config i can set the repo
	appRepo := repo.NewAppRepo(appConfig, dbConn)


	// depndency injection of app repo to all parts of the app
	api.SetNewRotuerConfig(appRepo)

	server := http.Server{
		Addr: fmt.Sprintf(":%s", port),
		MaxHeaderBytes: 3 << 20, // 3MB
		Handler: api.Router(),
	}

	err= server.ListenAndServe()
	if err != nil {
		log.Fatalf("error loading env %v", err)
	}

}