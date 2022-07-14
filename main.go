package main

import (
	"log"
	"os"

	"github.com/sirupsen/logrus"

	"github.com/joho/godotenv"
	"planetart.com/sincerely-devtools/githubapi"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	// do something here to set environment depending on an environment variable
	// or command-line flag
	if os.Getenv("ENVIRONMENT") == "production" {
		logrus.SetFormatter(&logrus.JSONFormatter{})
	} else {
		// The TextFormatter is default, you don't actually have to do this.
		logrus.SetFormatter(&logrus.TextFormatter{})
	}

	logger := logrus.New()

	logger.Info("test")
	log.Println("test")

	s3Bucket := os.Getenv("SKYNET_TOKEN_INK")

	println(s3Bucket)

	// githubapi.Releases("sincerely")
	githubapi.DeleteOldReleates()
}

// github delete-old-releases
// tool jira
// jira check-release
// jira checksite <site>
// jira component <site>
// jira components <project>
// jira get-issues <site>
// jira resolve <key>
// jira gitpull
// jira match <site>
// tasks jenkins
// tasks update-deployment-status
// tasks jira
// tasks clean-branches
