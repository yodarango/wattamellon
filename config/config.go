package config

type AppConfig struct {
	Env string 
}


func NewAppConfig(env string) *AppConfig {

	config := &AppConfig{
		Env: env,
	}

	return config
}