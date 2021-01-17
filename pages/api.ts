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
    index: async (repository, branch) => {
      const { data } = await axios.get('/api/deploy', {
        params: {
          repository,
          branch,
        }
      })

      return data;
    },
    histories: async (repository, branch, site) => {
      const { data } = await axios.get('/api/deploy/histories', {
        params: {
          repository,
          branch,
          site,
        }
      })

      return data;
    },
    deploy: async (repository, branch, site) => {
      const { data } = await axios.post('/api/deploy', {
        repository, branch, site
      });

      return data;
    },
    createBranch: async (repository, branch, sha) => {
      const { data } = await axios.post('/api/deploy/create-branch', {
        repository, branch, sha
      });

      return data;
    },
    deleteBranch: async (repository, branch) => {
      const { data } = await axios.delete('/api/deploy/delete-branch', {
        params: {
          repository, branch
        }
      });

      return data;
    },
    pullToStage: async (repository, branch) => {

      const { data } = await axios.post('/api/deploy/pull', {
        repository, branch
      });

      return data;
    },
    hideDeployButton: async (repository, branch, sha) => {

    },
  },
}
