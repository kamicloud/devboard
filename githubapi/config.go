package githubapi

func init() {
}

type ConfigType struct {
	Jenkins struct {
		Enabled        bool
		Username       string
		Password       string
		Host           string
		Jobs           string
		DingtalkToken  string
		DingtalkToken2 string
		SlackToken     string
	}

	Dingtalk struct {
		Token string
	}

	Jira struct {
		Endpoint  string
		Username  string
		Password  string
		ProjectId string
	}

	Database struct {
		Enabled  bool
		Host     string
		Username string
		Password string
		Database string
	}
}
