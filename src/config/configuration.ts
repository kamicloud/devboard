export default () => ({
  jenkins: {
    enabled: process.env.JENKINS_ENABLED,
    username: process.env.JENKINS_USERNAME,
    password: process.env.JENKINS_PASSWORD,
    host: process.env.JENKINS_HOST,
    jobs: process.env.JENKINS_JOBS,
    dingdingToken: process.env.JENKINS_DINGDING_TOKEN,
  }
});
