import { bool, Parsed, Command, text } from "../command";
import { ok, error, ask } from "../console";
import { spin } from "../spinner";
import { existsSync, mkdirSync, copyFileSync, chmodSync, writeFileSync } from "fs";
import { remove } from "../remove";
import { join } from "path";
import chalk from "chalk";
import { spawn } from "../spawn";

const templateDir = join(__dirname, '../templates');
let _options = {
	force: bool('-f', 'Overrides target directory'),
	npm: bool('-n', 'Install npm dependencies'),
	style: text('-s <style>', 'Define the style of command you will use', /^(git|single)$/,'single')
};
let RelPathRoot;
function fFile(...path:string[]) {
	path.splice(0,0,RelPathRoot);
	let last:string = path.pop();
	ok(join(...path, chalk.green(last)).replace(/\\/mg, '/'));
}
function project (...path:string[]) {
	return join(RelPathRoot, ...path);
}
function copy (file:string, target?:string) {
	target =target || file;
	copyFileSync(join(templateDir, file), project(target));
	fFile(...target.split('\\'));
}
export default class New extends Command {
	description = 'Creates a new MCE project.'
    arguments = '<application>'
    options = _options
    async action(application:string, options:Parsed<typeof _options>) {
		RelPathRoot = application;
		let clean_dir = options.force;
		if( existsSync(application) && !options.force ) {
			clean_dir = true;
			if ( !await ask('Directory already exist. Do you want to override it') ) {
				return;
			}
		}
		if ( clean_dir ) {
			await spin('Cleanig path', async () => {
				remove(application);
			});
		}
		await spin('Creating Files', async () => {
			mkdirSync(application);
			fFile();
			copy('app', application);
			chmodSync(project(application), 744 );
			// fFile(application);
		});
		copy('tsconfig.json');
		mkdirSync(project('src'));
		fFile('src');
		let cli = `import { MCE } from "node-mce";`;
		if (options.style === 'git') {
			cli += '\n\nMCE(__dirname).subcommand(process.argv);';
		} else {
			cli += '\n\nMCE(__dirname).command(process.argv);'
		}
		writeFileSync(project('src', 'cli.ts'), cli)
		fFile('src', 'cli.ts');

		if(options.style === 'git') {
			mkdirSync(project('src','commands'));
			fFile('src', 'commands');
			copy(join('src', 'index.ts.tmp'), join('src', 'commands', 'removeme.ts'));
		} else {
			copy(join('src', 'index.ts.tmp'), join('src', 'index.ts'));
		}
		

		mkdirSync(project('.vscode'));
		fFile('.vscode');
		copy(join('.vscode', 'launch.json'));
		copy(join('.vscode', 'settings.json'));
		copy(join('.vscode', 'tasks.json'));
		let _package = {
			name: application,
			version: '1.0.0',
			description: '',
			main: `./${application}`,
			bin: {
				[application]: `./${application}`
			},
			scripts: {
				test: "mocha test/**/*.test.ts"
			},
			repository: {},
			keywords:['mce', 'cmd'],
			author:'',
			license:'MIT',
			devDependencies: {
				"@types/node": "^10.3.2",
				"mocha": "^5.2.0",
				"ts-node": "^6.1.1",
				"typescript": "^2.9.1"
			},
			dependencies: {
				"chalk": "^2.4.1",
				"signal-exit": "^3.0.2"
			}
		};
		if(!process.env.MCE_DEV) {
			_package.dependencies["node-mce"] = "*";
		}
		writeFileSync(project("package.json"), JSON.stringify(_package, null,2));
		if(options.npm) {
			await spin('Initializing npm', async() => {
				if ( !await spawn('npm', ['install', '-S'], {cwd: project()}).catch(()=>false) ) {
					error('npm installation failed');
				}
				if ( process.env.MCE_DEV ) {
					await spawn('npm', ['link', 'node-mce'], {cwd: project()}).catch(()=>false)
				}
			});
		}
		await spin('Initializing git', async()=>{
			if ( !await spawn('git', ['init'], {cwd: project()}).catch(()=>false) ) {
				error('git init')
			}
		});
		copy('.gitignore');
    }
}