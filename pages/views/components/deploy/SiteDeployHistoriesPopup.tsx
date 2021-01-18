import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Table, Radio, Divider, Button, Menu, Dropdown, Select, Card } from 'antd';
import _ from 'lodash';
import api from 'pages/api';

export const SiteDeployHistoriesPopup = (props: {
  project: string,
  branch: string,
  site: string
}) => {
  const { project, branch } = props;
  const [loading, setLoading] = useState(false);
  const [deployHistories, setDeploymentHistories] = useState([]);

  useEffect(() => {
    setLoading(true);
    api.deploy.histories(project, branch, props.site).then(data => {
      setDeploymentHistories(data.gitDeployHistories);
      setLoading(false);
    });
  }, [props.site])

  return <Card
    title={`Deployment history for ${props.site}:`}
    style={{ width: 900 }}
    bordered={true}
    loading={loading}
  >
    {
      deployHistories.map(deploymentHistory => {
        return <pre key={deploymentHistory.id} style={{ marginBottom: 0 }}>
          {deploymentHistory.linkTime} hash: {deploymentHistory.sha1.substr(0, 7)} branch: {deploymentHistory.branch}
          {deploymentHistory.release ? ` release: ${deploymentHistory.release}` : null}
          &nbsp;&lt;{deploymentHistory.adminName}&gt;
        </pre>
      })
    }
  </Card>
};
