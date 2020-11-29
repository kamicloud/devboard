import * as React from 'react';
import { useState } from 'react';
import { NextPage, NextPageContext } from 'next';
import { Table, Radio, Divider, Avatar, Tooltip, Select } from 'antd';
import { Pages } from 'src/pages';
import { Jira } from 'src/type';
import { useSelector, useDispatch } from 'react-redux'
import Axios from 'axios';

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

const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  },
  getCheckboxProps: record => ({
    disabled: record.name === 'Disabled User',
    // Column configuration not to be checked
    name: record.name,
  }),
};

const Kanban: NextPage<Pages.KanbanPageProps> = (props: Pages.KanbanPageProps) => {
  const [userList, setUserList] = useState([]);
  const [assignee, setAsignee] = useState('');
  const [issues, setIssues] = useState(props.issues);
  const [groups, setGroups] = useState(props.groups)

  const { count, increment, decrement, reset } = useCounter()

  return <div>
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
        const { data } = await Axios.get('/api/kanban/group_members', {
          params: {
            id: value,
          },
        });

        setUserList(data.groupMembers)
      }}
    >
      {
        groups.map((group: Jira.Group) => {
          return <Select.Option key={group.id} value={group.id}>{group.name}</Select.Option>
        })
      }
    </Select>

    {
      userList ? <Select
        style={{ width: 200 }}
        onChange={async (value: string) => {
          setAsignee(value)
          const { data } = await Axios.get('/api/kanban/issues', {
            params: {
              assignee: value,
            }
          })

          setIssues(data.issues)
        }}
      >
        {
          userList.map((user: Jira.Member) => {
            return <Select.Option key={user.accountId} value={user.accountId}>{user.displayName}</Select.Option>
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
      <Table.Column title='Assignee' dataIndex='fields' key='key' render={(field) => {
        if (!field || !field.assignee) {
          return '';
        }

        const { assignee } = field;
        return <>
          <Avatar src={assignee.avatarUrls['48x48']} />
          {` ${assignee.displayName}`}
        </>;
      }} />
    </Table>
  </div>;
};

Kanban.getInitialProps = async (ctx: NextPageContext & {
  query: Pages.KanbanPageProps
}) => {
  const { query } = ctx;

  return query;
};

export default Kanban;
