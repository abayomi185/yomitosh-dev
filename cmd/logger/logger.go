// logger/logger.go
package logger

import (
	"log/slog"
	"os"
)

var Logger *slog.Logger

func init() {
	// Initialize the global logger
	Logger = slog.New(slog.NewJSONHandler(os.Stdout, nil))
}
