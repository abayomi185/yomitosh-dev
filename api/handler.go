package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/abayomi185/yomitosh-dev/api/adapters"
	"github.com/abayomi185/yomitosh-dev/api/constants"
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
	message := "This HTTP triggered function executed successfully. Pass a name in the query string for a personalized response.\n"
	name := r.URL.Query().Get("name")
	if name != "" {
		message = fmt.Sprintf("Hello, %s. This HTTP triggered function executed successfully.\n", name)
	}
	fmt.Fprint(w, message)
}

func main() {
	listenAddr := ":8080"
	if val, ok := os.LookupEnv("FUNCTIONS_CUSTOMHANDLER_PORT"); ok {
		listenAddr = ":" + val
	}

	http.HandleFunc("/api/helloworld", helloHandler)
	http.HandleFunc("/api/vercel/", Handler)

	log.Printf("About to listen on %s. Go to https://127.0.0.1%s/", listenAddr, listenAddr)
	log.Fatal(http.ListenAndServe(listenAddr, nil))
}

// For vercel deployment
func Handler(w http.ResponseWriter, r *http.Request) {
	// Get the request path
	path := strings.TrimPrefix(r.URL.Path, "/api/vercel")
	log.Printf("Request Path: %s\n", path)

	// Forward request based on path using switch statement
	switch {
	case constants.AnthropicRegex.MatchString(path):
		adapters.AnthropicAdapter(w, r)
	case constants.OpenAIRegex.MatchString(path):
		adapters.OpenAIAdapter(w, r)
	case constants.OllamaRegex.MatchString(path):
		adapters.OllamaAdapter(w, r)
	default:
		adapters.DefaultAdapter(w, r)
	}
}
