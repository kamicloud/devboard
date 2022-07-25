package jiraapi

import (
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func GetReleaseDeployingHistories() {
	dsn := "user:pass@tcp(127.0.0.1:3306)/dbname?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	// if (!this.connection) {
	//   return [];
	// }

	// const gitDeployHistories = await this.connection.manager
	//   .getRepository(GitDeployHistory)
	//   .find({
	//     where: {
	//       repository: project,
	//       branch,
	//     },
	//     order: {
	//       id: 'DESC'
	//     },
	//     take: 1000,
	//   });

	// return gitDeployHistories;
}

func updateDeploymentStatus() {
	// this.logger.log('update-deployment-status');
	// const project = 'sincerely';
	// const jenkinsProjectName = 'sincerely-snapi';

	// const deployHistories = await this.databaseService.getReleaseDeployingHistories(project);

	// for (const deployHistory of deployHistories) {
	//   const data = await this.jenkinsService.getBranch(jenkinsProjectName, deployHistory.release);

	//   if (data && data.latestRun) {
	//     if (data.latestRun.result === 'SUCCESS' || data.latestRun.result === 'FAILURE') {
	//       deployHistory.deploymentStatus = 'deployed';
	//       await this.databaseService.updateDeployHistoryStatus(
	//         deployHistory,
	//         data.latestRun.result === 'FAILURE' ? 'blocked' : 'deployed'
	//       )
	//     }
	//   }
	// }
}

func loadJiraActivities() {
	// this.logger.log('jira started');
	// const { issues } = await this.jiraService.search();

	// const jiraLastRun = this.jiraLastRun;
	// this.jiraLastRun = new Date();

	// const filteredIssues = issues.filter(issue => {
	//   const { fields } = issue;

	//   const updated = new Date(fields.updated);

	//   if (jiraLastRun.getTime() >= updated.getTime() || this.jiraLastRun.getTime() < updated.getTime()) {
	//     return false;
	//   }

	//   return true;
	// });

	// for (const issue of filteredIssues) {
	//   const { fields } = issue;

	//   const created = new Date(fields.created);
	//   const updated = new Date(fields.updated);

	//   const { values } = await this.jiraService.changelog(issue.key);
	//   const { comments } = await this.jiraService.comments(issue.key);
	//   // console.log(issue.key, fields.summary, updated);

	//   const isCreated = jiraLastRun.getTime() < created.getTime();

	//   let finalContent = (isCreated ? '[NEW] ' : '') + `[${issue.key}] ${fields.summary}\n`;

	//   finalContent += values.filter(value => {
	//     const created = new Date(value.created);

	//     if (jiraLastRun.getTime() >= created.getTime() || this.jiraLastRun.getTime() < updated.getTime()) {
	//       return false;
	//     }

	//     return true;
	//   }).map(value => {
	//     const created = new Date(value.created);
	//     // console.log(value, jiraLastRun, created)
	//     const content = value.items.map(item => {
	//       const { field } = item;

	//       return `${field}: ${item.fromString} => ${item.toString}`;
	//     }).join("\n");
	//     return `Author: ${value.author.displayName}\n${content}\n`;
	//   }).join("\n");

	//   finalContent += comments.filter(comment => {
	//     const updated = new Date(comment.updated);
	//     if (jiraLastRun.getTime() >= updated.getTime() || this.jiraLastRun.getTime() < updated.getTime()) {
	//       return false;
	//     }
	//     return true;
	//   }).map(comment => {

	//     return `${comment.author.displayName}: ` + this.jiraService.parseJiraDoc(comment.body);
	//   }).join("\n");

	//   finalContent += "\n";

	//   const { dingtalkToken2 } = this.configService.get<any>('jenkins');
	//   // const { data } = await axios.post(`https://oapi.dingtalk.com/robot/send?access_token=${dingtalkToken2}`, {
	//   //   msgtype: 'text',
	//   //   text: {
	//   //     content: finalContent,
	//   //   }
	//   // });
	//   console.log(finalContent);
	// }
}
