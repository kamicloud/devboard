import { Controller, Get, Query, Render, Param, Req } from '@nestjs/common';
import { AppService } from '../../services/app.service';
import { NodegitService } from '../../services/nodegit.service';
import { GithubService } from '../../services/github.service';
import config from '../../utils/configUtil';
import { GitDeployHistory } from '../../entities/GitDeployHistory.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('deploy')
export class DeployController {
  constructor(
    private readonly appService: AppService,
    private readonly githubService: GithubService,
    private readonly nodegitService: NodegitService,
    @InjectRepository(GitDeployHistory)
    private gitDeployHistoryRepository: Repository<GitDeployHistory>,
  ) {}

  @Render('pages/deploy')
  @Get()
  public async index(
    @Query('repository')
    repository: string,
    @Query('branch')
    branch: string = 'master'
  ) {
      const branches = await this.githubService.branches(repository);
      const commits = await this.githubService.commits(repository, branch);
      const repositoryConfig = config.getRepositoryConfig(repository);
      const repositories = [
        repository,
      ];
      const gitDeployHistories = await this.gitDeployHistoryRepository.find({
        where: {
          repository: 'sincerely',
          branch,
        },
        order: {
          id: 'DESC'
        },
        take: 100,
      });

      return {
        branches,
        commits,
        owner: repositoryConfig.orgnization,
        repository,
        branch,
        repositories,
        sites: repositoryConfig.sites,
        gitDeployHistories,
      }
  }
}
