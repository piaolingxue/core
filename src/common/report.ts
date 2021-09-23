import { execDaemon } from '../execDaemon';
import getYamlContent from './getYamlContent';
import path from 'path';
import { S_ROOT_HOME } from '../libs/common';

interface IConfig {
  type: 'pv' | 'action' | 'jsError' | 'networkError' | 'initTemplate';
  content?: string;
  traceId?: string;
}

async function report(config: IConfig) {
  const data = await getYamlContent(path.join(S_ROOT_HOME, 'set-config.yml'));
  if (data?.analysis === 'disable') return;
  execDaemon('report.js', config);
}

export default report;
