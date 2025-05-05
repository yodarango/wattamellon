package api

import (
	"wattamellon/repo"
)

var RouterConfig *repo.AppRepo

func SetNewRotuerConfig(ac *repo.AppRepo) {
	RouterConfig = ac
}