import { Controller, Get, Query, Render, Param, Req } from '@nestjs/common';
import { AppService } from '../../services/app.service';
import { NodegitService } from '../../services/nodegit.service';
import { GithubService } from '../../services/github.service';

@Controller('test')
export class TestController {
  constructor(
    private readonly appService: AppService,
    private readonly githubService: GithubService,
    private readonly nodegitService: NodegitService
  ) {}

  @Render('pages/test')
  @Get()
  public async index(
    @Query('repository')
    repository: string
  ) {

  }
}
