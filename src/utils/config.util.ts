import YAML from 'yamljs';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class ConfigUtil {
  private static repositoryConfig;

  public getRepositoryConfig(project) {
    if (!ConfigUtil.repositoryConfig) {
      ConfigUtil.repositoryConfig = YAML.load('./repository.yaml');
    }
    return ConfigUtil.repositoryConfig.projects[project];
  }

  public getRepositoryUrl(repository) {
    const config = this.getRepositoryConfig(repository);
    return `https://${config.token}@github.com/${config.orgnization}/${name}`;
  }
}
