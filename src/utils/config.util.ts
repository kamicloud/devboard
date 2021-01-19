import YAML from 'yamljs';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class ConfigUtil {
  public getRepositoryConfig(project) {
    const repositoryConfig = YAML.load('./repository.yaml');

    const config = repositoryConfig.projects[project];

    return config;
  }

  public getRepositoryUrl(repository) {
    const config = this.getRepositoryConfig(repository);

    return `https://${config.token}@github.com/${config.orgnization}/${name}`;
  }
}
