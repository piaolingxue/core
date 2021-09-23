import fs from 'fs-extra';
import path from 'path';
import get from 'lodash.get';
import execa, { StdioOption } from 'execa';
import report from './report';
import spinner from './spinner';
import { readJsonFile } from '../libs/utils';

interface IOptions {
  cwd?: string;
  production?: boolean;
  stdio?: StdioOption;
}

function checkYarn() {
  try {
    execa.sync('yarn', ['-v']);
    return true;
  } catch (error) {
    return false;
  }
}

const npmInstall = async (
  options: {
    npmList?: string[];
    baseDir?: string;
    production?: boolean;
    registry?: string;
    showLoading?: boolean;
  } = {},
) => {
  const { showLoading, baseDir, npmList, production } = options;
  const pkgJson: string = path.join(baseDir, 'package.json');
  if (!fs.existsSync(pkgJson)) {
    fs.writeFileSync(pkgJson, '{}');
  }
  let spin;
  if (showLoading) {
    spin = spinner('Dependencies installing...');
  }
  const registry = options.registry ? ` --registry=${options.registry}` : '';
  try {
    const client = checkYarn() ? 'yarn' : get(process.env, 'NPM_CLIENT', 'npm');
    execa.sync(
      `${client} install ${
        // eslint-disable-next-line no-nested-ternary
        npmList ? `${npmList.join(' ')}` : production ? '--production' : ''
      }${registry}`,
      { cwd: baseDir, shell: true, stdio: 'ignore' },
    );
  } catch (error) {
    report({ type: 'networkError', content: error });
    const errmsg = (error && error.message) || error;
    console.log(` - npm install err ${errmsg}`);
  } finally {
    if (showLoading) {
      spin.stop();
    }
  }
};

async function installDependency(options?: IOptions) {
  const cwd = get(options, 'cwd', process.cwd());
  const packageInfo: any = readJsonFile(path.resolve(cwd, 'package.json'));
  if (!packageInfo || !get(packageInfo, 'autoInstall', true)) return;
  const nodeModulePath = path.resolve(cwd, 'node_modules');
  if (fs.existsSync(nodeModulePath)) return;

  await npmInstall({
    baseDir: cwd,
    showLoading: get(options, 'showLoading', true),
    production: get(options, 'production', true),
  });
}

export default installDependency;
