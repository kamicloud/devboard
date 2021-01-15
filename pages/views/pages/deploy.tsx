import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { NextPage, NextPageContext } from 'next';
import { Table, Radio, Divider, Button, Menu, Dropdown, Select, Card } from 'antd';
import { Pages } from 'src/pages';
import _ from 'lodash';
import CommitMessage from '../components/deploy/CommitMessage';
import { useRouter } from 'next/router'
import api from 'pages/api';
import { PlusSquareOutlined } from '@ant-design/icons';

interface DeployTableButton {
  site: string,
  status: string | 'deployable' | 'hotfixed' | 'deployed' | 'blocked' | 'disabled',
}

interface DeployTableRow {
  sha: string,
  type: string,

  hotfixed?: boolean,
  temp?: boolean,
  sites?: {
    pre: DeployTableButton[],
    live: DeployTableButton[],
  },
  date?: string,
  author?: string,
  message?: string,
}

const SiteDeployHistoriesPopup = (props) => {
  const { repository, branch } = props;
  const [loading, setLoading] = useState(false);
  const [deployHistories, setDeploymentHistories] = useState([]);

  useEffect(() => {
    setLoading(true);
    api.deploy.histories(repository, branch, props.site).then(data => {
      setDeploymentHistories(data.gitDeployHistories);
      setLoading(false);
    });
  }, [props.site])

  return <Card
    title={`Deployment history for ${props.site}:`}
    style={{ width: 900 }}
    bordered={true}
    loading={loading}
  >
    {
      deployHistories.map(deploymentHistory => {
        return <p key={deploymentHistory.id}>
          {deploymentHistory.linkTime} hash: {deploymentHistory.sha1.substr(0, 7)} branch: {branch}
          {deploymentHistory.release ? ` release: ${deploymentHistory.release}` : null}
          &lt;{deploymentHistory.adminName}&gt;
        </p>
      })
    }
  </Card>
};

const Deploy: NextPage<Pages.DeployPageProps> = (props: Pages.DeployPageProps) => {
  const router = useRouter()
  const [repository, setRepository] = useState(props.repository);
  const [branch, setBranch] = useState(props.branch);
  const [commits, setCommits] = useState(props.commits);
  const [repositories, setRepositories] = useState(props.repositories);
  const [gitDeployHistories, setGitDeployHistories] = useState(props.gitDeployHistories)
  const [branches, setBranches] = useState(props.branches)
  const [owner, setOwner] = useState(props.owner)
  const [sites, setSites] = useState(props.sites);
  const [gitHotfixedCommits, setGitHotfixedCommits] = useState(props.gitHotfixedCommits);

  const [branchLoading, setBranchLoading] = useState(false);

  useEffect(() => {
    setBranchLoading(true);
    api.deploy.index(repository, props.branch).then((props: Pages.DeployPageProps) => {
      setBranch(props.branch)
      setRepository(props.repository)
      setCommits(props.commits);
      setRepositories(props.repositories);
      setGitDeployHistories(props.gitDeployHistories);
      setBranches(props.branches);
      setOwner(props.owner);
      setSites(props.sites);
      setGitHotfixedCommits(props.gitHotfixedCommits);

      setBranchLoading(false);
    });
  }, [props.branch])

  const shaDeployHistories = _.groupBy(gitDeployHistories, 'sha1');
  const shaHotfixedCommits = _.keyBy(gitHotfixedCommits.map(gitHotfixedCommit => {
    gitHotfixedCommit.key = `${gitHotfixedCommit.sha}-${gitHotfixedCommit.isTemp ? '-temp' : 'hotfix'}`;
    return gitHotfixedCommit
  }), 'key')

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
    const findSiteDeployHistory = (site, status) => {
      return siteDeployHistories[`${sha}-${site}-${status}`]
    }

    const calcButtonData = (site: string): DeployTableButton => {
      let status = 'deployable'
      if (findSiteDeployHistory(site, 'deployed')) {
        status = 'deployed'
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

    /**
     * Display button row if has is_hidden = 0 records.
     * first record force display buttons
     */
    if (!index || displayButton) {
      tableData.push({
        sha: `${sha}_button`,
        type: 'button',
        sites: commitSites,
      })
    }

    tableData.push({
      sha,
      type: 'commit',
      date: commit.commit.author.date,
      author: commit.commit.author.name,
      message: commit.commit.message,
    });
  })

  const columns = [
    {
      dataIndex: 'sha',
      key: 'action',
      width: 10,
      render: (field, model: DeployTableRow) => {
        const menu = (
          <Menu>
            <Menu.Item>
              Create Hotfix Branch
            </Menu.Item>
            <Menu.Item>
              Create Temp Branch
            </Menu.Item>
            <Menu.Item>
              Hide Deployment Buttons
            </Menu.Item>
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
      render: (field, model: DeployTableRow) => {
        return <>
          {
            model.type === 'button' ? <pre style={{ marginBottom: 0 }}>{field.substr(0, 7)}</pre> : <a
              href={`https://github.com/${owner}/${repository}/commit/${field}`}
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
      render: (field, model: DeployTableRow, index) => {
        const commitMessages: string[] = model.type === 'commit' ? _.flatten(model.message.split("\n\n").map(message => message.split("\r\n"))) : [''];
        const commitMessage = commitMessages[0];

        const buttonType = (status) => {
          if (status === 'deployed') {
            return 'primary';
          } else if (status === 'hotfixed') {
            return 'dashed';
          }

          return 'default';
        }

        const buttonRender = (site) => {
          return <Dropdown
          key={site.site}
          overlay={
              <SiteDeployHistoriesPopup
                repository={repository}
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
              size='small'
              type={buttonType(site.status)}
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
                shaHotfixedCommits[`${field}-hotfix`] ? <span>View Hotfix</span> : null
              }
              {
                shaHotfixedCommits[`${field}-temp`] ? <>
                  View Temp
                </> : null
              }
            </div> : <div>
                <CommitMessage
                  commitMessage={commitMessage}
                  repository={repository}
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
          {'Repository: '}
          <Select
            style={{
              width: 200,
            }}
            value={repository}
            onChange={(value) => {
              router.push({
                pathname: '/deploy',
                query: {
                  repository: value,
                }
              })
            }}
          >
            {
              repositories.map(repository => {
                return <Select.Option
                  key={repository}
                  value={repository}
                >{repository}</Select.Option>
              })
            }
          </Select>
          {'Branch: '}
          <Select
            style={{
              width: 500,
            }}
            value={branch}
            loading={branchLoading}
            disabled={branchLoading}
            onChange={(value) => {
              setBranchLoading(true);
              router.push({
                query: {
                  repository: repository,
                  branch: value,
                }
              }, {
                pathname: '/deploy',
                query: {
                  repository: repository,
                  branch: value,
                }
              })
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
        <div>Deployment for branch "{branch}"</div>
        <Table
          columns={columns}
          dataSource={tableData}
          size='small'
          rowKey='sha'
          pagination={false}
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
