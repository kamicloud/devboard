import * as React from 'react';
import { useState } from 'react';
import { NextPage, NextPageContext } from 'next';
import { Table, Radio, Divider } from 'antd';

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
    render: text => <pre>{text}</pre>,
  },
  {
    title: 'Date',
    dataIndex: 'date',
  },
  {
    title: 'Message',
    dataIndex: 'message',
  },
  {
    title: 'Author',
    dataIndex: 'author',
    render: (model) => <>{model.name}&lt;{model.email}&gt;</>
  },
  {
    title: 'Operations',
    render: () => {
      return <span>Deploy</span>
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

const Demo = (props) => {
  const [selectionType, setSelectionType] = useState('checkbox');
  return (
    <div>
      <Radio.Group
        onChange={({ target: { value } }) => {
          setSelectionType(value);
        }}
        value={selectionType}
      >
        <Radio value="checkbox">Checkbox</Radio>
        <Radio value="radio">radio</Radio>
      </Radio.Group>

      <Divider />

      <Table
        size='small'
        columns={columns}
        dataSource={props.commits}
      />
    </div>
  );
};
const Index: NextPage<Props> = ({ query }) => {
  return <div>
    <Demo
      commits={query.commits}
    />
  </div>;
};

Index.getInitialProps = async (ctx: Props & NextPageContext) => {
  const { query } = ctx;
  return { query };
};

export default Index;
