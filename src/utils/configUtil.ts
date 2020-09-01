import YAML from 'yamljs';

export default class ConfigUtil {
  public static getRepositoryConfig(repository) {
    const repositoryConfig = YAML.load('./repository.yaml');

    const config = repositoryConfig.repositories[repository];

    return config;
  }

  public static getRepositoryUrl(repository) {
    const config = this.getRepositoryConfig(repository);

    return `https://${config.token}@github.com/${config.orgnization}/${name}`;
  }
}
