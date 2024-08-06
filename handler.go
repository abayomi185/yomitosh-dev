package main

import (
	"log"
	"net/http"
	"os"

	handler "github.com/abayomi185/yomitosh-dev/api"
	"github.com/abayomi185/yomitosh-dev/cmd/constants"
)

func main() {
	listenAddr := ":8080"
	if val, ok := os.LookupEnv("FUNCTIONS_CUSTOMHANDLER_PORT"); ok {
		listenAddr = ":" + val
	}

	http.HandleFunc(constants.APIHealthPath, handler.HealthHandler)
	http.HandleFunc(constants.APIChatPath+"/", handler.ChatHandler)

	log.Printf("About to listen on %s. Go to https://127.0.0.1%s/", listenAddr, listenAddr)
	log.Fatal(http.ListenAndServe(listenAddr, nil))
}
