import {Args, Command, Flags} from '@oclif/core'

export default class Generate extends Command {
  static description = 'generate one of model manager outputs'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]
  static aliases = ['g']
  static flags = {
    // flag with a value (-n, --name=VALUE)
    name: Flags.string({char: 'n', description: 'name to print'}),
    // flag with no value (-f, --force)
    force: Flags.boolean({char: 'f'}),
  }

  static enableJsonFlag = true

   static args = {
    file: Args.string(
      {
        name: 'file',               // name of arg to show in help and reference with args[name]
        required: false,            // make the arg required with `required: true`
        description: 'output file', // help description
        hidden: true,               // hide this arg from help
       // parse: input => 'output',   // instead of the user input, return a different value
        default: 'world',           // default value if no arg input
        options: ['a', 'b'],        // only allow input to be from a discrete set
      }
    ),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Generate)

    const name = flags.name ?? 'world'
    this.log(`hello ${name} from C:\\Users\\sinis\\projects\\AelastiscS\\apps\\moma\\src\\commands\\generate.ts`)
    if (args.file && flags.force) {
      this.log(`you input --force and --file: ${args.file}`)
    }
  }
}
