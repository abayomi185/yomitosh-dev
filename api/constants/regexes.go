package constants

import "regexp"
import "log"

// compileRegex is a helper function that compiles regex and handles errors.
func compileRegex(pattern string) *regexp.Regexp {
	regex, err := regexp.Compile(pattern)
	if err != nil {
		log.Fatalf("failed to compile regex pattern %s: %v", pattern, err)
	}
	return regex
}

var (
	AnthropicRegex = compileRegex(`^/anthropic$`)
	OpenAIRegex    = compileRegex(`^/openai$`)
	OllamaRegex    = compileRegex(`^/ollama$`)
)
