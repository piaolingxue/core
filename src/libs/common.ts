/**
 * @description 业务通用代码
 */

import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import getYamlContent from './getYamlContent';
import getMAC from 'getmac';
import yaml from 'js-yaml';
import _ from 'lodash';
import { getCurrentEnvironment } from '@serverless-devs/utils';

const semver = require('semver');

const USER_HOME = os.homedir();

export function useLocal() {
  return process.env.default_serverless_devs_registry_mode === 'local';
}

export function formatWorkspacePath(val: string) {
  return val.replace(/~/, USER_HOME);
}

export function getConfig(key?: string, defaultValue?: any) {
  const sJsonPath = path.join(getRootHome(), 'config', 's.json');
  if (fs.existsSync(sJsonPath)) {
    const data = fs.readJsonSync(sJsonPath);
    const val = key ? data[key] : data;
    return val || defaultValue;
  }
}

export function getSetConfig(key: string, defaultValue?: any) {
  const setConfigPath = path.join(getRootHome(), 'set-config.yml');
  const res = getYamlContent(setConfigPath);
  if (!res) return defaultValue;
  return res[key];
}

export function setConfig(key: string, value: any) {
  if (key === 'workspace') {
    const shomedir = path.join(USER_HOME, '.s');
    const sJsonPath = path.join(shomedir, 'config', 's.json');
    if (fs.existsSync(sJsonPath)) {
      const data = fs.readJsonSync(sJsonPath);
      data[key] = formatWorkspacePath(value);
      fs.writeJsonSync(sJsonPath, data);
    } else {
      fs.ensureFileSync(sJsonPath);
      fs.writeJsonSync(sJsonPath, { [key]: formatWorkspacePath(value) });
    }
    return;
  }

  const sJsonPath = path.join(getRootHome(), 'config', 's.json');
  if (fs.existsSync(sJsonPath)) {
    const data = fs.readJsonSync(sJsonPath);
    data[key] = value;
    fs.writeJsonSync(sJsonPath, data);
  } else {
    fs.ensureFileSync(sJsonPath);
    fs.writeJsonSync(sJsonPath, { [key]: value });
  }
}

export async function setConfigYaml(key: string, value: any) {
  const filePath = path.join(getRootHome(), 'set-config.yml');
  const data = await getYamlContent(filePath);
  if (data) {
    data[key] = value;
    fs.writeFileSync(filePath, yaml.dump(data));
  } else {
    fs.ensureFileSync(filePath);
    fs.writeFileSync(filePath, yaml.dump({ [key]: value }));
  }
}

export const getCliVersion = (defaultValue?: string) => {
  const { CLI_VERSION } = process.env;
  return CLI_VERSION || defaultValue;
};

export function getRootHome() {
  const shomedir = path.join(USER_HOME, '.s');
  const sJsonPath = path.join(shomedir, 'config', 's.json');
  if (fs.existsSync(sJsonPath)) {
    const data = fs.readJsonSync(sJsonPath);
    return data.workspace ? formatWorkspacePath(data.workspace) : shomedir;
  }
  // 不存在 ～/.s/config/s.json
  if (semver.gt(getCliVersion('0.0.0'), '2.0.92')) {
    const env = getCurrentEnvironment();
    if (env === 'yunxiao') return path.join(USER_HOME, '.cache', '.s');
  }
  return shomedir;
}

export const isBetaS = () => getCliVersion('0.0.0').includes('beta');

export const S_CURRENT_HOME = path.join(process.cwd(), '.s');

export const S_CURRENT = path.join(process.cwd(), './');

export const getSComponentPath = () => path.join(getRootHome(), 'components');

export const getCommand = () => {
  try {
    const command = JSON.parse(process.env['serverless_devs_temp_argv']);
    return command ? `s ${command.join(' ')}` : undefined;
  } catch (error) { }
};

export const getPid = () => {
  try {
    return getMAC().replace(/:/g, '');
  } catch (error) {
    return 'unknown';
  }
};
