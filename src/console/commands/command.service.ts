import { Console, Command, createSpinner, ConsoleService } from 'nestjs-console';
import { Injectable } from '@nestjs/common';

@Console()
@Injectable()
export class CommandService {

  constructor(private readonly consoleService: ConsoleService) {
    // get the root cli
    const cli = this.consoleService.getCli();

    // create a single command (See [npm commander arguments/options for more details])
    this.consoleService.createCommand(
      {
        command: 'list <directory> <a>',
        description: 'description'
      },
      this.listContent,
      cli // attach the command to the cli
    );

    // create a parent command container
    const groupCommand = this.consoleService.createGroupCommand(
      {
        command: 'new',
        description: 'A command to create an item'
      },
      cli // attach the command to the root cli
    );

    this.consoleService.createCommand(
      {
        command: 'file <name>',
        description: 'Create a file'
      },
      this.createFile,
      groupCommand // attach the command to the group
    );
  }

  @Command({
    command: 'list <directory> <b>',
    description: 'List content of a directory'
  })
  async listContent(directory: string): Promise<void> {
    // See Ora npm package for details about spinner
    const spin = createSpinner();
    spin.start(`Listing files in directory ${directory}`);

    // simulate a long task of 1 seconds
    const files = await new Promise((done) => setTimeout(() => done(['fileA', 'fileB']), 1000));

    spin.succeed('Listing done');

    // send the response to the  cli
    // you could also use process.stdout.write()
    console.log(JSON.stringify(files));
  }

  createFile = async (name: string) => {
    console.log(`Creating a file named ${name}`);
    // your code...
  };
}
