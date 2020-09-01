import Git from 'nodegit';
import configUtil from './configUtil';
import fse from 'fs-extra';

export default class RepositoryUtil {
  public static getRepositoryNameByUrl(repositoryUrl) {
    const arr = repositoryUrl.split('/').filter();

    if (!arr.length) {
      throw new Error('invalid repo name');
    }

    return arr[arr.length - 1];
  }

  public static async cloneRepository(repository, force = false) {
    const repositoryConfig = configUtil.getRepositoryConfig(repository);

    const opts = repositoryConfig.token ? {
      fetchOpts: {
        callbacks: {
          credentials: function() {
            return Git.Cred.userpassPlaintextNew(repositoryConfig.token, "x-oauth-basic");
          },
          certificateCheck: function() {
            return 0;
          }
        }
      }
    } : null;

    const path = './storage/repositories/' + repositoryConfig.name;

    if (force) {
      await fse.remove(path);
    }
    const repo = await Git.Clone(repositoryConfig.url, path, opts)
    // const commit = await repo.getCommit("59b20b8d5c6ff8d09518454d4dd8b7b30f095ab5");
    // const entry = await commit.getEntry("README.md");
    // const blob = entry.getBlob();
    // blob.entry = entry;

    // console.log(blob.entry.path() + blob.entry.sha() + blob.rawsize() + "b");
    // console.log(Array(72).join("=") + "\n\n");
    // console.log(String(blob));
    console.log('cloned ' + repository);
  }

  public static async getRepositoryCommits(repository: string, branch: string, perpage = 50, page = 1) {
    const config = configUtil.getRepositoryConfig(repository);
    const commits = [];
    const repo = await Git.Repository.open('./storage/repositories/' + config.name);

    const addCommitDTO = (commit) => {
      const author = commit.author();
      commits.push({
        author: {
          name: author.name(),
          email: author.email(),
        },
        sha: commit.sha(),
        date: commit.date(),
        message: commit.message(),
      });
    }

    let commit = await repo.getBranchCommit(branch);
    for (let i = perpage * (page - 1); i < perpage; i++) {
      addCommitDTO(commit)
      commit = await commit.parent(0);
    }

    return commits;
  }
}
