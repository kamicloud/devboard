import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { NextPage, NextPageContext } from 'next';
import { Table, Radio, Divider, Button, Menu, Dropdown, Select, Card } from 'antd';
import { Pages } from 'src/pages';
import { Github } from 'src/type';
import _ from 'lodash';
import CommitMessage from '../components/deploy/CommitMessage';
import { useRouter } from 'next/router'
import api from 'pages/api';
import { PlusSquareOutlined } from '@ant-design/icons';
import { SiteDeployHistoriesPopup } from '../components/deploy/SiteDeployHistoriesPopup'

interface DeployTableButton {
  site: string,
  status: string | 'deployable' | 'hotfixed' | 'deployed' | 'blocked' | 'disabled',
}

interface DeployTableRow {
  key: string,
  sha: string,
  type: string,
  display: boolean,

  hotfixed?: boolean,
  temp?: boolean,
  sites?: {
    pre: DeployTableButton[],
    live: DeployTableButton[],
  },
  button?: DeployTableRow,
  date?: string,
  author?: string,
  message?: string,
}

const hashToHotfix = (sha: string, isTemp: boolean) => {
  return (isTemp ? 'tempbranches/' : 'hotfixes/') + sha.substr(0, 7)
}

const buttonType = (status: string) => {
  if (status === 'deployed') {
    return 'primary';
  } else if (status === 'hotfixed') {
    return 'dashed';
  }

  return 'default';
}

const Deploy: NextPage<Pages.DeployPageProps> = (props: Pages.DeployPageProps) => {
  const router = useRouter()
  const [project, setProject] = useState(props.project);
  const [branch, setBranch] = useState(props.branch);
  const [commits, setCommits] = useState(props.commits);
  const [projects, setProjects] = useState(props.projects);
  const [gitDeployHistories, setGitDeployHistories] = useState(props.gitDeployHistories)
  const [branches, setBranches] = useState(props.branches)
  const [owner, setOwner] = useState(props.owner)
  const [sites, setSites] = useState(props.sites);
  const [gitHotfixedCommits, setGitHotfixedCommits] = useState(props.gitHotfixedCommits);

  const [branchLoading, setBranchLoading] = useState(false);
  const [displayButtonMap, setDisplayButtonMap] = useState({});

  const shaDeployHistories = _.groupBy(gitDeployHistories, 'sha1');
  const shaHotfixedCommits = _.keyBy(gitHotfixedCommits.map(gitHotfixedCommit => {
    gitHotfixedCommit.key = `${gitHotfixedCommit.sha}-${gitHotfixedCommit.isTemp ? '-temp' : 'hotfix'}`;
    return gitHotfixedCommit
  }), 'key')

  const navigateBranch = (project: string, branch: string) => {
    const query = {
      project,
      branch,
    }
    router.push({
      query
    }, {
      pathname: '/deploy',
      query,
    })
  }

  const tableData: DeployTableRow[] = [];

  commits.forEach((commit, index) => {
    const sha = commit.sha;

    const matches = shaDeployHistories[sha] ? shaDeployHistories[sha] : [];

    const displayButton = matches.filter(match => {
      return !match.isHidden;
    }).length;

    const siteDeployHistories = _.keyBy(matches.map(gitDeployHistory => {
      gitDeployHistory.key = `${gitDeployHistory.sha1}-${gitDeployHistory.siteName}-${gitDeployHistory.deploymentStatus}`
      return gitDeployHistory;
    }), 'key');

    const findSiteDeployHistory = (site: string, status: string) => {
      return siteDeployHistories[`${sha}-${site}-${status}`]
    }

    const calcButtonData = (site: string): DeployTableButton => {
      let status = 'deployable'
      if (findSiteDeployHistory(site, 'deployed')) {
        status = 'deployed'
      } else if (findSiteDeployHistory(site, 'hotfixed')) {
        status = 'hotfixed'
      } else if (findSiteDeployHistory(site, 'deploying')) {
        status = 'deploying'
      } else if (findSiteDeployHistory(site, 'disabled')) {
        status = 'disabled'
      } else if (findSiteDeployHistory(site, 'blocked')) {
        status = 'blocked'
      }

      return {
        site,
        status,
      }
    }

    const commitSites = {
      pre: sites.pre.map(calcButtonData),
      live: sites.live.map(calcButtonData)
    }

    const buttonData: DeployTableRow = {
      key: `${sha}_button`,
      sha,
      type: 'button',
      display: !index || displayButton || displayButtonMap[sha],

      sites: commitSites,
    };

    /**
     * Display button row if has is_hidden = 0 records.
     * first record force display buttons
     */
    tableData.push(buttonData)

    tableData.push({
      key: sha,
      sha,
      type: 'commit',
      display: true,

      button: buttonData,
      date: commit.commit.author.date,
      author: commit.commit.author.name,
      message: commit.commit.message,
    });
  })

  useEffect(() => {
    if (branch !== props.branch) {
      setBranchLoading(true);
      setBranch(props.branch)
      api.deploy.index(project, props.branch).then((props: Pages.DeployPageProps) => {
        setBranch(props.branch)
        setProject(props.project)
        setCommits(props.commits);
        setProjects(props.projects);
        setGitDeployHistories(props.gitDeployHistories);
        setBranches(props.branches);
        setOwner(props.owner);
        setSites(props.sites);
        setGitHotfixedCommits(props.gitHotfixedCommits);

        setBranchLoading(false);
      });
    }

  }, [props.branch]);

  const columns = [
    {
      dataIndex: 'sha',
      key: 'action',
      width: 10,
      render: (field: string, model: DeployTableRow, index) => {
        const menu = (
          <Menu>
            <Menu.Item onClick={() => {
              api.deploy.createBranch(project, branch, hashToHotfix(field, false));
            }}>
              Create Hotfix Branch
            </Menu.Item>
            <Menu.Item onClick={() => {
              api.deploy.createBranch(project, branch, hashToHotfix(field, true));
            }}>
              Create Temp Branch
            </Menu.Item>
            {model.button && model.button.display ? null : <Menu.Item onClick={async () => {
              if (model.button && model.button.display) {
                await api.deploy.hideDeployButton(project, branch, field);
                // await
              } else {
                displayButtonMap[field] = true
                setDisplayButtonMap({ ...displayButtonMap })
              }
            }}>
              {model.button && model.button.display ? 'Hide' : 'Show'} Deployment Buttons
            </Menu.Item>}
          </Menu>
        );
        return model.type === 'commit' ? <Dropdown overlay={menu} placement="bottomLeft" arrow>
          <PlusSquareOutlined />
        </Dropdown> : null;
      }
    },
    {
      title: 'Sha',
      dataIndex: 'sha',
      key: 'sha',
      width: 30,
      render: (field: string, model: DeployTableRow) => {
        return <>
          {model.type === 'button' ? <pre style={{ marginBottom: 0 }}>{field.substr(0, 7)}</pre> : <a
            href={`https://github.com/${owner}/${project}/commit/${field}`}
            target='blanket'
          >
            <pre style={{ marginBottom: 0 }}>{field.substr(0, 7)}</pre>
          </a>
          }

        </>
      }
    },
    {
      title: 'Sites',
      dataIndex: 'sha',
      key: 'sha',
      width: 1000,
      render: (field: string, model: DeployTableRow, index) => {
        const commitMessages: string[] = model.type === 'commit' ? _.flatten(model.message.split("\n\n").map(message => message.split("\r\n"))) : [''];
        const commitMessage = commitMessages[0];

        const buttonRender = (site: DeployTableButton) => {
          return <Dropdown
            key={site.site}
            overlay={
              <SiteDeployHistoriesPopup
                project={project}
                branch={branch}
                site={site.site}
              />
            }
            placement="bottomLeft"
            arrow
          >
            <Button
              style={{
                marginLeft: '5px',
                marginRight: '5px',
              }}
              onClick={() => {
                if (confirm(`Deploy ${site.site} from branch: ${branch} commit: ${model.sha}?`)) {
                  api.deploy.deploy(project, branch, site.site);
                }
              }}
              size='small'
              loading={site.status === 'deploying'}
              disabled={['deploying', 'blocked', 'disabled'].indexOf(site.status) !== -1}
              type={buttonType(site.status)}
              danger={['deployed', 'deploying', 'hotfixed'].indexOf(site.status) !== -1}
            >{site.site}</Button>
          </Dropdown>
        }

        return <>
          {
            model.type === 'button' ? <div>
              {
                model.sites.pre.map(buttonRender)
              }
              <Divider type="vertical" />
              {
                branch === 'master' || branch.startsWith('hotfixes/') ? model.sites.live.map(buttonRender) : null
              }
              {
                shaHotfixedCommits[`${field}-hotfix`] ? <Button onClick={() => {
                  navigateBranch(project, hashToHotfix(field, false));
                }}>View Hotfix</Button> : null
              }
              {
                shaHotfixedCommits[`${field}-temp`] ? <Button onClick={() => {
                  navigateBranch(project, hashToHotfix(field, true));
                }}>
                  View Temp
                </Button> : null
              }
            </div> : <div>
                <CommitMessage
                  commitMessage={commitMessage}
                  project={project}
                  owner={owner}
                  date={model.date}
                  author={model.author}
                />
              </div>
          }
        </>
      }
    },
  ];

  return (
    <>
      <div>
        <div>
          {'Project: '}
          <Select
            style={{
              width: 200,
            }}
            showSearch
            value={project}
            onChange={(value) => {
              router.push({
                pathname: '/deploy',
                query: {
                  project: value,
                }
              })
            }}
          >
            {
              projects.map(project => {
                return <Select.Option
                  key={project}
                  value={project}
                >{project}</Select.Option>
              })
            }
          </Select>
          {`Branch(${branches.length}): `}
          <Select
            style={{
              width: 500,
            }}
            showSearch
            value={branch}
            loading={branchLoading}
            disabled={branchLoading}
            onChange={(value) => {
              setBranchLoading(true);
              navigateBranch(project, value);
            }}
          >
            {branches.map((branch) => {
              return <Select.Option
                key={branch.name}
                value={branch.name}>{branch.name}</Select.Option>
            })}

          </Select>
          <Button>Pull To Stage</Button>
        </div>
        <Table
          columns={columns}
          title={() => `Deployment for branch "${branch}"`}
          dataSource={tableData.filter(data => {
            return data.display;
          })}
          size='small'
          rowKey='key'
          pagination={false}
          loading={branchLoading}
        // expandable={{
        //   expandIcon: () => null,
        //   expandedRowRender: (record) => <p style={{ margin: 0 }}>{record.commit.message}</p>,
        //   rowExpandable: () => true,
        //   defaultExpandAllRows: true,
        // }}
        />
      </div>
    </>
  );
};

Deploy.getInitialProps = async (ctx: NextPageContext & {
  query: Pages.DeployPageProps
}) => {
  const { query } = ctx;

  return query;
};

export default Deploy;
