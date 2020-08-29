import YAML from 'yamljs';

export default {
  getRepositoryConfig: (repository) => {
    const repositoryConfig = YAML.load('./repository.yaml');

    const config = repositoryConfig.repositories[repository];

    return config;
  }
}
