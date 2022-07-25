package githubapi

import (
	"encoding/json"
	"os"

	"github.com/go-resty/resty/v2"
)

func GetRuns(job string) (*JenkinsRuns, error) {
	host := os.Getenv("JENKINS_HOST")
	username := os.Getenv("JENKINS_USERNAME")
	password := os.Getenv("JENKINS_PASSWORD")

	client := resty.New()

	temp, err := client.R().
		EnableTrace().
		SetBasicAuth(username, password).
		Get(host + "/blue/rest/organizations/jenkins/pipelines/" + job + "/runs/")

	if err != nil {
		return nil, err
	}

	var runs []JenkinsRun
	err = json.Unmarshal(temp.Body(), &runs)

	runs2 := JenkinsRuns(runs)

	return &runs2, err
}

type JenkinsRun struct {
	Id        string
	Pipeline  string
	State     string
	ChangeSet []interface{}
	Result    string
	Causes    []struct {
		ShortDescription string
	}
}

type JenkinsRuns []JenkinsRun

func (runs *JenkinsRuns) Reverse() *JenkinsRuns {
	realRuns := []JenkinsRun(*runs)

	for i, j := 0, len(realRuns)-1; i < j; i, j = i+1, j-1 {
		realRuns[i], realRuns[j] = realRuns[j], realRuns[i]
	}

	var runs2 JenkinsRuns
	runs2 = JenkinsRuns(realRuns)

	runs = &runs2

	return &runs2
}

type JenkinsBranch struct {
	LatestRun JenkinsRun
}

//   public async getRuns(job: string): Promise<{ data: Jenkins.Run[] }> {
//     const { username, password, host } = this.configService.get<any>('jenkins');
//     let res = await axios.get(`${host}/blue/rest/organizations/jenkins/pipelines/${job}/runs/`, {
//       auth: {
//         username,
//         password,
//       }
//     }).catch((error: Error) => {
//       console.log(error.message, error.stack, error.name)
//     });

//     // sometimes data from jenkins api cutting off and parsed as string
//     if (!res || typeof res.data === 'string') {
//       return { data: [] };
//     }

//     let { data } = res;

//     return { data };
//   }

func GetBranch(job string, branch string) error {
	return nil
}

//   public async getBranch(job, branch): Promise<Jenkins.Branch | null> {
//     const { username, password, host } = this.configService.get<any>('jenkins');
//     const res = await axios.get(`${host}/blue/rest/organizations/jenkins/pipelines/${job}/branches/${branch}/`, {
//       auth: {
//         username,
//         password,
//       }
//     }).catch((error: Error) => {
//       console.log(error.message, error.stack, error.name)
//     });

//     if (!res || !res.data) {
//       return null;
//     }

//     return res.data;
//   }

func mapResult(result string) string {
	if result == "UNKNOWN" {
		return "in progress"
	}

	if result == "SUCCESS" {
		return "success"
	}

	if result == "FAILURE" {
		return "failed"
	}

	return result
}

func mapState(state string) string {
	if state == "FINISHED" {
		return "finished"
	}

	if state == "RUNNING" {
		return "running"
	}

	if state == "QUEUED" {
		return "in queue"
	}

	return state
}
