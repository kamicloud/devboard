import * as React from 'react';
import { useState } from 'react';
import { NextPage, NextPageContext } from 'next';
import { Table, Radio, Divider } from 'antd';

interface Props {
  query: { name?: string };
}

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    render: (text) => {
      return text;
    }
  },
  {
    title: 'Name',
    dataIndex: 'key',
    render: (text, model) => {
      return `[${text}] ${model.fields.summary}`;
    }
  },
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

const Kanban: NextPage<Props> = ({ query }) => {
  const greetName = query.name ? query.name : 'World';
  const [selectionType, setSelectionType] = useState('checkbox');
  return <div>
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
      columns={columns}
      dataSource={query.issues.issues}
    />
  </div>;
};

Kanban.getInitialProps = async (ctx: NextPageContext) => {
  const { query } = ctx;
  console.log('query', query)
  return { query };
};

export default Kanban;
