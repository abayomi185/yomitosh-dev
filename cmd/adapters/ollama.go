package adapters

import (
	"fmt"
	"io"
	"net/http"
)

func OllamaAdapter(w http.ResponseWriter, r *http.Request) {

	// Read the request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Unable to read body", http.StatusBadRequest)
		return
	}
	// Ensure the body is closed after reading
	defer r.Body.Close()

	// Process the body (for example, print it)
	fmt.Fprintf(w, "Handled by OllamaAdapter: %s", string(body))

	message := "This HTTP triggered function executed successfully. Pass a name in the query string for a personalized response.\n"
	name := r.URL.Query().Get("name")
	if name != "" {
		message = fmt.Sprintf("Hello, %s. This HTTP triggered function executed successfully.\n", name)
	}
	fmt.Fprint(w, message)
}
