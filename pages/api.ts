import Axios from "axios"
import { async } from "rxjs";

export default {
  kanban: {
    issues: async (value) => {
      const { data } = await Axios.get('/api/kanban/issues', {
        params: {
          assignee: value,
        }
      })

      return data;
    },
    groupMembers: async (value) => {
      const { data } = await Axios.get('/api/kanban/group_members', {
        params: {
          id: value,
        },
      });

      return data;
    }
  },
  deploy: {
    index: async (repository, branch) => {
      const { data } = await Axios.get('/api/deploy', {
        params: {
          repository,
          branch,
        }
      })

      return data;
    },
    histories: async (repository, branch, site) => {
      const { data } = await Axios.get('/api/deploy/histories', {
        params: {
          repository,
          branch,
          site,
        }
      })

      return data;
    }
  },
}
