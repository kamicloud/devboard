import * as React from 'react';
import { useState } from 'react';
import { NextPage, NextPageContext } from 'next';
import { Table, Divider, Avatar, Tooltip, Select, Button } from 'antd';
import { Pages } from 'src/pages';
import { Jira } from 'src/type';
import { useSelector, useDispatch } from 'react-redux'
import PageLayout from '../components/PageLayout';
import api from '../../api';
import _ from 'lodash';

const useCounter = () => {
  const count = useSelector((state: any) => state.count)
  const dispatch = useDispatch()
  const increment = () =>
    dispatch({
      type: 'INCREMENT',
    })
  const decrement = () =>
    dispatch({
      type: 'DECREMENT',
    })
  const reset = () =>
    dispatch({
      type: 'RESET',
    })
  return { count, increment, decrement, reset }
}

const Kanban: NextPage<Pages.KanbanPageProps> = (props: Pages.KanbanPageProps) => {
  const [userList, setUserList] = useState([]);
  const [assignee, setAsignee] = useState('');
  const [issues, setIssues] = useState(props.issues);
  const [groups, setGroups] = useState(props.groups);

  const { count, increment, decrement, reset } = useCounter()

  const branchMap = _.keyBy(props.branches, 'name')

  return <PageLayout>
    <div>
      <h1>
        Count: <span>{count}</span>
      </h1>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
      <button onClick={reset}>Reset</button>
    </div>

    <Select
      style={{ width: 200 }}
      onChange={async (value) => {
        const data = await api.kanban.groupMembers(value);

        setUserList(data.groupMembers)
      }}
    >
      {
        groups.map((group: Jira.Group) => {
          return <Select.Option
            key={group.id}
            value={group.id}
          >{group.name}</Select.Option>
        })
      }
    </Select>

    {
      userList ? <Select
        style={{ width: 200 }}
        onChange={async (value: string) => {
          setAsignee(value)

          const data = await api.kanban.issues(value);

          setIssues(data.issues)
        }}
      >
        {
          userList.map((user: Jira.Member) => {
            return <Select.Option
              key={user.accountId}
              value={user.accountId}
            >{user.displayName}</Select.Option>
          })
        }
      </Select> : null
    }

    <Divider />

    <Table
      dataSource={issues.issues}
    >
      <Table.Column title='ID' dataIndex='id' key='key' />
      <Table.Column title='Name' dataIndex='key' key='key' render={(field, model: Jira.Issue) => {
        return <>
          <a href={`${props.common.endpoint}/browse/${field}`} target='blanket'>{`[${field}]`}</a>
          {` ${model.fields.summary}`}
          <br />
          {`${new Date(model.fields.updated).toLocaleString()} `}
          <Avatar size='small' src={model.fields.priority.iconUrl} />
          {model.fields.duedate}
        </>
      }} />
      <Table.Column title='Description' dataIndex='fields' key='key' />
      <Table.Column title='Status' dataIndex='fields' key='key' render={(field) => {
        if (!field || !field.status) {
          return '';
        }

        const { status } = field;

        return <Tooltip title={status.description} placement='top'>
          <Avatar src={status.iconUrl} />
          {` ${status.name}`}
        </Tooltip>
      }

      } />
      <Table.Column title='Components' dataIndex='fields' key='key' render={(field: Jira.IssueFields) => {
        return (
          <>
            {field.components ? field.components.map(component => {
              return (
                <Tooltip
                  key={component.id}
                  title={component.description}
                  placement='top'
                >
                  <p>{component.name}</p>
                </Tooltip>
              );
            }) : null}
          </>
        );
      }}
      />
      <Table.Column title='Assignee' dataIndex='fields' key='key' render={field => {
        if (!field || !field.assignee) {
          return '';
        }

        const { assignee }: { assignee: Jira.AuthorProfile } = field;
        return <>
          <Avatar src={assignee.avatarUrls['48x48']} />
          {` ${assignee.displayName}`}
        </>;
      }} />
      <Table.Column title='Operation' dataIndex='key' key='key' render={(field: string) => {
        return (branchMap[field.toLowerCase()] ? <>
          <Button>Create/Delete Branch</Button>
          <Button>View Branch</Button>
        </> : null)
      }}
      />
    </Table>
  </PageLayout>;
};

Kanban.getInitialProps = async (ctx: NextPageContext & {
  query: Pages.KanbanPageProps
}) => {
  const { query } = ctx;

  return query;
};

export default Kanban;
