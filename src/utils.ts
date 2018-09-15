import chalk from "chalk";
import { ok } from "./console";
import { targetPath } from "./paths";
import { join } from "path";
export function fFile(...path:string[]) {
    let last:string = path.pop();
    let route = chalk.grey(join(...path).replace(/\\/mg, '/'));
	return `${route}/${chalk.green(last)}`;
}
function print (mode:String, text:string) {
    let fpath = text.replace(targetPath(), '').replace(/\\/gm, '/').split('/');
    ok(`\t${chalk.cyan('created')}: ${fFile(...fpath)}`);
}

export const created = print.bind(null, 'created');
export const updated = print.bind(null, 'updated');
