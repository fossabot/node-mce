import { bool, collect, enumeration, floating, list, numeric, Parsed, range, text, verbose } from '../../src';
import { cliPath, targetPath } from '../../src/paths';
import { render } from '../../src/render';
export let description = 'A description for your command';
export let args = '';
export let options = {
    enumeration: enumeration('-e <enum>', 'Define the style of command you will use', ['git', 'single']),
    number: numeric('-n <n>', 'A number'),
    floating: floating('-f <n>', 'A float number'),
    text: text('-t <n>', 'A string value'),
    list: list('-l <n>', 'comma separed values'),
    collect: collect('-c <n>', 'A repetable value'),
    render: bool('-r', 'A boolean value'),
    verbose: verbose('Increase system verbosity'),
};

export async function action(opt:Parsed<typeof options>) {
    let target = opt.render ? cliPath('../test/demo.txt'): undefined;
    return render(cliPath('../test/file.txt'), {demo: 'works'}, target);
}