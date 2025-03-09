package main

import (
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
	err = godotenv.Load()

	if err != nil {
		log.Fatalf("error loading env %v", err)
	}

	env := os.Getenv("ENV")

	appConfig := config.NewAppConfig(env)

	// now that I have both the db connection and the app config i can set the repo
	appRepo := repo.NewAppRepo(appConfig, dbConn)


	// depndency injection of app repo to all parts of the app
	api.SetNewRotuerConfig(appRepo)

	server := http.Server{
		Addr: ":8008",
		MaxHeaderBytes: 3 << 20, // 3MB
		Handler: api.Router(),
	}

	err= server.ListenAndServe()
	if err != nil {
		log.Fatalf("error loading env %v", err)
	}

}