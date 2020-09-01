import * as React from 'react';
import { useState } from 'react';
import { NextPage, NextPageContext } from 'next';
import { Table, Radio, Divider, Button } from 'antd';

interface Props {
  query: {
    name?: string,
    commits: {
      sha: string,
      date: string,
      message: string,
    }[]
  };
}

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
    return <pre>{text.split("\n\n")[0]}</pre>},
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
      <Button>CherryPick</Button>
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
    </div>
  );
};
const Index: NextPage<Props> = ({ query }) => {
  return <div>
    <CommitsTable
      commits={query.commits}
    />
  </div>;
};

Index.getInitialProps = async (ctx: Props & NextPageContext) => {
  const { query } = ctx;
  return { query };
};

export default Index;
