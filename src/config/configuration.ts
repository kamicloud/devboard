export default () => ({
  jenkins: {
    enabled: process.env.JENKINS_ENABLED,
    username: process.env.JENKINS_USERNAME,
    password: process.env.JENKINS_PASSWORD,
    host: process.env.JENKINS_HOST,
    jobs: process.env.JENKINS_JOBS,
    dingdingToken: process.env.JENKINS_DINGDING_TOKEN,
    dingtalkToken2: process.env.JENKINS_DINGTALK_TOKEN2,
    slackToken: process.env.JENKINS_SLACK_TOKEN,
  },
  jira: {
    endpoint: process.env.JIRA_ENDPOINT,
    username: process.env.JIRA_USERNAME,
    password: process.env.JIRA_PASSWORD,
    projectId: process.env.JIRA_PROJECT_ID,
  },
  database: {
    enabled: process.env.DB_ENABLED,
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  }
});
