import * as React from 'react';
import { Layout, Menu } from 'antd';
import { Pages } from 'src/pages';


const CommitMessage: React.FC<{
  commitMessage: string,
  owner: string,
  repository: string,
  date: string,
  author: string
}> = (props) => {
  if (!props.commitMessage) {
    return null;
  }

  const pullRequests = props.commitMessage.match(/\(#\d+\)/g)
  const messages = props.commitMessage.split(/\(#\d+\)/)
  return <>
    {`${props.date} - ${props.author} - `}
    {messages.map((message, i) => {
      return <React.Fragment
        key={i}
      >
        {i > 0 ? <a href={`https://github.com/${props.owner}/${props.repository}/pull/${pullRequests[i - 1].replace(/[\(\)#]/g, '')}`} target='blanket'>
          {pullRequests[i - 1]}
        </a> : null}
        {message}
      </React.Fragment>
    })}</>;
};

export default CommitMessage;
