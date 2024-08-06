package adapters

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/abayomi185/yomitosh-dev/cmd/constants"
	logger "github.com/abayomi185/yomitosh-dev/cmd/logger"
)

var log = logger.Logger

const OpenAICompletionsEndpoint = "https://api.openai.com/v1/chat/completions"

type GPTModel string

type OpenAIMessageContent struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

type OpenAIMessage struct {
	Role     string                 `json:"role"`
	Content  []OpenAIMessageContent `json:"content"`
	ImageURL string                 `json:"image_url,omitempty"`
}

type OpenAIPayload struct {
	Model       GPTModel        `json:"model"`
	Temperature float64         `json:"temperature"`
	Stream      bool            `json:"stream"`
	Messages    []OpenAIMessage `json:"messages"`
	MaxTokens   int             `json:"max_tokens"`
}

func OpenAIAdapter(w http.ResponseWriter, r *http.Request) {

	AccessKey := os.Getenv("ACCESS_KEY")
	OpenAIKey := os.Getenv("OPENAI_API_KEY")

	var body struct {
		Prompt       OpenAIMessageContent `json:"prompt"`
		UserMessages []OpenAIMessage      `json:"userMessages"`
		Model        GPTModel             `json:"model"`
		AccessKey    string               `json:"accessKey"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	imagePresent := false

	for _, message := range body.UserMessages {
		if message.ImageURL != "" {
			imagePresent = true
			break
		}
	}

	if body.AccessKey == AccessKey || len(body.UserMessages) < 5 {
		cvPrompt := constants.CVPrompts

		systemMessages := []OpenAIMessageContent{
			{"text", "Don't make reponses overly verbose. Keep them short and conscise where possible."},
			{"text", "Respond as a knowledgeable and intelligent person known as AGI Yomi."},
			{"text", "Yomi is a mellow person that studied a Bachelors in Electronic Engineering at The University of Sheffield. Yomi then went on to study Artificial Intelligence at The University of Loughborough."},
			{"text", "Yomi is a real person and not a fictional character."},
			{"text", "Yomi currently work as a Software Engineer at Aurora Energy Research in Oxford, England."},
			{"text", fmt.Sprintf("This is Yomi's CV: \n%s", cvPrompt)},
		}

		payload := OpenAIPayload{
			Model:       body.Model,
			Temperature: 0.7,
			Stream:      true,
			Messages:    []OpenAIMessage{{Role: "system", Content: systemMessages}},
			MaxTokens:   1024,
		}

		if !imagePresent {
			payload.MaxTokens = 4096
		}

		payload.Messages = append(payload.Messages, body.UserMessages...)

		payloadBytes, err := json.Marshal(payload)
		if err != nil {
			log.Error(err.Error())
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		req, err := http.NewRequest("POST", OpenAICompletionsEndpoint, bytes.NewReader(payloadBytes))
		if err != nil {
			log.Error(err.Error())
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+OpenAIKey)

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			log.Error(err.Error())
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}
		defer resp.Body.Close()

		w.Header().Set("Content-Type", "application/json")
		io.Copy(w, resp.Body)

		return
	}

	accessKeyError := `Your friendly neighbourhood AGI Yomi unfortunately has to limit users using this feature.
		It is costing human Yomi a small fortune 🥲
		Human Yomi is happy to hand out auth codes if contacted. Yomi also welcomes donations.
		Oh and please try again in a few hours`
	http.Error(w, accessKeyError, http.StatusUnauthorized)

}
