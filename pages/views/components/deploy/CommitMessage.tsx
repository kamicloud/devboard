import * as React from 'react';
import { Layout, Menu } from 'antd';
import { Pages } from 'src/pages';


const CommitMessage: React.FC<{
  commitMessage: string,
  owner: string,
  project: string,
  date: string,
  author: string
}> = (props) => {
  if (!props.commitMessage) {
    return null;
  }

  const pullRequests = props.commitMessage.match(/\(#\d+\)/g)
  const messages = props.commitMessage.split(/\(#\d+\)/)
  return <pre style={{ marginBottom: 0 }}>
    {`${props.date} - ${props.author} - `}
    {messages.map((message, i) => {
      return <React.Fragment
        key={i}
      >
        {i > 0 ? <a href={`https://github.com/${props.owner}/${props.project}/pull/${pullRequests[i - 1].replace(/[\(\)#]/g, '')}`} target='blanket'>
          {pullRequests[i - 1]}
        </a> : null}
        {message}
      </React.Fragment>
    })}</pre>;
};

export default CommitMessage;
