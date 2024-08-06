package handler

import (
	"log"
	"net/http"
	"strings"

	"github.com/abayomi185/yomitosh-dev/cmd/adapters"
	"github.com/abayomi185/yomitosh-dev/cmd/constants"
)

// For vercel deployment
func ChatHandler(w http.ResponseWriter, r *http.Request) {
	// Get the request path
	path := strings.TrimPrefix(r.URL.Path, constants.APIChatPath)
	log.Printf("Request Path: %s\n", path)

	r.Header.Set("Content-Type", "application/json")
	r.Header.Set("Accept", "text/event-stream")
	r.Header.Set("Cache-Control", "no-cache")
	r.Header.Set("Connection", "keep-alive")

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
