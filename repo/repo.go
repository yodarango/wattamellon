package repo

import (
	"wattamellon/config"
	"wattamellon/internal/db"
)

type AppRepo struct {
	AppConfig *config.AppConfig
	DB *db.DBConfig
}


func NewAppRepo(ac *config.AppConfig, db *db.DBConfig) *AppRepo{
	repo := &AppRepo{
		AppConfig: ac,
		DB: db,
	}

	return repo
}