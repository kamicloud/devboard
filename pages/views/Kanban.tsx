import * as React from 'react';
import { useState } from 'react';
import { NextPage, NextPageContext } from 'next';
import { Table, Radio, Divider, Avatar, Tooltip } from 'antd';
import { Pages } from 'src/pages';

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    render: (field) => {
      return field;
    }
  },
  {
    title: 'Name',
    dataIndex: 'key',
    render: (field, model) => {
      return `[${field}] ${model.fields.summary}`;
    }
  },
  {
    title: 'Description',
    dataIndex: 'fields',
    render: (field, model) => {
      return ``;
    }
  },
  {
    title: 'Status',
    dataIndex: 'fields',
    render: (field) => {
      if (!field || !field.status) {
        return '';
      }

      const { status } = field;

      return <React.Fragment>
        <Tooltip title={status.description} placement="top">
          <Avatar src={status.iconUrl} />
          {` ${status.name}`}
        </Tooltip>
      </React.Fragment>;
    }
  },
  {
    title: 'Assignee',
    dataIndex: 'fields',
    render: (field) => {
      if (!field || !field.assignee) {
        return '';
      }

      const { assignee } = field;
      return <React.Fragment>
        <Avatar src={assignee.avatarUrls['48x48']} />
        {` ${assignee.displayName}`}
      </React.Fragment>;
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

const Kanban: NextPage<Pages.KanbanPageProps> = ({ issues }) => {
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
      dataSource={issues.issues}
    />
  </div>;
};

Kanban.getInitialProps = async (ctx: NextPageContext & {
  query: Pages.KanbanPageProps
}) => {
  const { query } = ctx;

  return query;
};

export default Kanban;
