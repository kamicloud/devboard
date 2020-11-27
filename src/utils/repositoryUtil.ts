import Git from 'nodegit';
import configUtil from './configUtil';

export default class RepositoryUtil {
  public static getRepositoryNameByUrl(repositoryUrl) {
    const arr = repositoryUrl.split('/').filter();

    if (!arr.length) {
      throw new Error('invalid repo name');
    }

    return arr[arr.length - 1];
  }
}
