import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { NextPage, NextPageContext } from 'next';
import { Table, Radio, Divider, Button, Input, Space, Select } from 'antd';
import { Stage, Layer, Rect, Circle, Text, Label, Tag } from 'react-konva';
import { Pages } from 'src/pages';
import _ from 'lodash';
import CommitMessage from '../components/deploy/CommitMessage';

const Deploy: NextPage<Pages.DeployPageProps> = (props: Pages.DeployPageProps) => {
  const shaAndSiteDeployHistories = props.gitDeployHistories.map(gitDeployHistory => {
    gitDeployHistory.key = `${gitDeployHistory.sha}-${gitDeployHistory.siteName}`
    return gitDeployHistory;
  })

  const columns = [
    {
      title: 'Sha',
      dataIndex: 'sha',
      key: 'sha',
      width: 30,
      render: (field) => {
        return <>
          <a
            href={`https://github.com/${props.owner}/${props.repository}/commit/${field}`}
            target='blanket'
          >
            <pre>{field.substr(0, 7)}</pre>
          </a>
        </>
      }
    },
    {
      title: 'Sites',
      dataIndex: 'url',
      key: 'sha',
      width: 1000,
      render: (field, model, index) => {
        const commitMessages: string[] = _.flatten(model.commit.message.split("\n\n").map(message => message.split("\r\n")));
        const commitMessage = commitMessages[0];

        return <>
          <div>
            {
              props.sites.pre.map((site) => {
                return <Button
                  style={{
                    marginLeft: '5px',
                    marginRight: '5px',
                  }}
                  size='small'
                  key={site}
                >{site}</Button>
              })
            }
            <Divider type="vertical" />
            {
              props.sites.live.map((site) => {
                return <Button
                  style={{
                    marginLeft: '5px',
                    marginRight: '5px',
                  }}
                  key={site}
                  size='small'
                >{site}</Button>
              })
            }
          </div>
          <div>
            <CommitMessage
              commitMessage={commitMessage}
              repository={props.repository}
              owner={props.owner}
              date={model.commit.author.date}
              author={model.commit.author.name}
            />
          </div>
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
            value={props.repository}
          >
            {
              props.repositories.map(repository => {
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
            value={props.branch}
          >
            {props.branches.map((branch) => {
              return <Select.Option
                key={branch.name}
                value={branch.name}>{branch.name}</Select.Option>
            })}

          </Select>
        </div>
        <div>Deployment for branch "{props.branch}"</div>
        <Table
          columns={columns}
          dataSource={props.commits}
          size='small'
          rowKey='sha'
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
