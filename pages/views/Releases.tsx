import * as React from 'react';
import { useState, useRef } from 'react';
import { NextPage, NextPageContext } from 'next';
import { Table, Radio, Divider, Button, Input, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { Pages } from 'src/pages';

const dataIndex = 'name';
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


const ReleasesTable = (props) => {
  const [selectionType, setSelectionType] = useState('checkbox');
  const [selectedRowKeys] = useState('selectedRowKeys');
  const [searchedColumn, setSearchedColumn] = useState('searchedColumn');
  const [searchText, setSearchText] = useState('searchText');

  const searchInput: React.MutableRefObject<Input> = useRef(null);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchedColumn(dataIndex)
    setSearchText(selectedKeys[0])
  };

  const nameSearch = {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
      return <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    },
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.current.select(), 100);
      }
    },
    render: text => {

      return searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (text)
    },
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      ...nameSearch
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
    },
    {
      title: 'Message',
      dataIndex: 'body',
    },
    {
      title: 'Author',
      dataIndex: 'author',
      render: (model) => <a href={model.url}>{model.login}</a>
    },
    {
      title: 'Operations',
      render: () => {
        return <Button>Deploy</Button>
      }
    }
  ];
  return (
    <div>
      <Table
        size='small'
        columns={columns}
        rowKey='name'
        dataSource={props.data}
        rowSelection={rowSelection}
        expandable={{
          expandedRowRender: record => <pre>{record.message}</pre>,
        }}
      />
    </div>
  );
};
const Releases: NextPage<Pages.ReleasesPageProps> = ({ query }) => {
  return <div>
    <ReleasesTable
      data={query.releases}
    />
  </div>;
};

Releases.getInitialProps = async (ctx: NextPageContext & Pages.ReleasesPageProps) => {
  const { query } = ctx;
  return { query };
};

export default Releases;
