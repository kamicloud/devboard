import axios from "axios"

export default {
  kanban: {
    issues: async (value) => {
      const { data } = await axios.get('/api/kanban/issues', {
        params: {
          assignee: value,
        }
      })

      return data;
    },
    groupMembers: async (value) => {
      const { data } = await axios.get('/api/kanban/group_members', {
        params: {
          id: value,
        },
      });

      return data;
    }
  },
  deploy: {
    index: async (project, branch) => {
      const { data } = await axios.get('/api/deploy', {
        params: {
          project,
          branch,
        }
      })

      return data;
    },
    histories: async (project, branch, site) => {
      const { data } = await axios.get('/api/deploy/histories', {
        params: {
          project,
          branch,
          site,
        }
      })

      return data;
    },
    deploy: async (project, branch, site) => {
      const { data } = await axios.post('/api/deploy', {
        project, branch, site
      });

      return data;
    },
    createBranch: async (project, branch, sha) => {
      const { data } = await axios.post('/api/deploy/create-branch', {
        project, branch, sha
      });

      return data;
    },
    deleteBranch: async (project, branch) => {
      const { data } = await axios.delete('/api/deploy/delete-branch', {
        params: {
          project, branch
        }
      });

      return data;
    },
    pullToStage: async (project, branch) => {

      const { data } = await axios.post('/api/deploy/pull', {
        project, branch
      });

      return data;
    },
    hideDeployButton: async (repository, branch, sha) => {

    },
  },
}
