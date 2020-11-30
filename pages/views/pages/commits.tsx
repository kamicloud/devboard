import * as React from 'react';
import { useState } from 'react';
import { NextPage, NextPageContext } from 'next';
import { Table, Radio, Divider, Button } from 'antd';
import Axios from 'axios';
import { Pages } from 'src/pages';

const columns = [
  {
    title: 'Sha',
    dataIndex: 'sha',
    render: text => <pre>{text.substr(0, 7)}</pre>,
  },
  {
    title: 'Date',
    dataIndex: 'date',
  },
  {
    title: 'Message',
    dataIndex: 'message',
    render: text => {
      return <pre>{text.split("\n\n")[0]}</pre>
    },
  },
  {
    title: 'Author',
    dataIndex: 'author',
    render: (model) => <>{model.name}&lt;{model.email}&gt;</>
  },
  {
    title: 'Operations',
    render: () => {
      return <Button>Deploy</Button>
    }
  }
];
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

const CommitsTable = (props) => {
  const [selectionType, setSelectionType] = useState('checkbox');
  const [selectedRowKeys] = useState('selectedRowKeys');

  return (
    <div>
      Branch: {props.branch}
      <Button>CherryPick</Button>
      <Button onClick={() => {
        Axios.get('/api/releases/pull', {
          params: {
            repository: 'sincerely-snapi'
          }
        }).then(({ data }) => {
          console.log(data);
        })
      }}>Pull</Button>
      <Divider />

      <Table
        size='small'
        columns={columns}
        rowKey='sha'
        dataSource={props.commits}
        rowSelection={rowSelection}
        expandable={{
          expandedRowRender: record => <pre>{record.message}</pre>,
        }}
      />
    </div >
  );
};
const Commits: NextPage<Pages.CommitsPageProps> = ({ commits }) => {
  return <div>
    <CommitsTable
      commits={commits}
    />
  </div>;
};

Commits.getInitialProps = async (ctx: NextPageContext & {
  query: Pages.CommitsPageProps,
}) => {
  const { query } = ctx;
  return query;
};

export default Commits;
