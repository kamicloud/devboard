import { Injectable } from '@nestjs/common';

@Injectable()
export class ReleasesService {
  getHello(): string {
    return 'Hello World!';
  }
}
