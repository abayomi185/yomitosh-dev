package adapters

import (
	"fmt"
	"net/http"
)

func DefaultAdapter(w http.ResponseWriter, r *http.Request) {
	message := "Not sure what you're on about?"
	fmt.Fprint(w, message)
}
