package handler

import (
	"fmt"
	"net/http"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	message := "This Main entrypoint\n"
	name := r.URL.Query().Get("name")
	if name != "" {
		message = fmt.Sprintf("Hello, %s. This HTTP triggered function executed successfully.\n", name)
	}
	fmt.Fprint(w, message)
}
