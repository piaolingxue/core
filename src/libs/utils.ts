/**
 * @description 用于存放工具函数
 */

import { nanoid } from 'nanoid';
import * as fs from 'fs-extra';
import { Logger } from '../logger';
import report from '../common/report';
import { IGlobalParams } from '../interface';
import { split } from 'lodash';
import minimist from 'minimist';

export const logger = new Logger('S-CORE');

export function getServerlessDevsTempArgv() {
  try {
    return JSON.parse(process.env.serverless_devs_temp_argv);
  } catch (error) {
    return [];
  }
}

export function transformGlobalArgs(args: string): IGlobalParams {
  const data = minimist(split(args, ' '), {
    alias: {
      access: 'a',
    },
    boolean: ['debug', 'skip-actions'],
  });
  return {
    access: data.access,
    debug: data.debug,
    skipActions: data['skip-actions'],
  };
}

export const uuid = nanoid;

export function readJsonFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    try {
      return JSON.parse(data);
    } catch (error) {
      report({
        type: 'jsError',
        content: `${error.message}||${error.stack}`,
      });
    }
  } else {
    logger.debug(`readJsonFile: the file ${filePath} does not exist`);
  }
}

export function writeJsonFile(filePath: string, data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function sleep(timer: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), timer);
  });
}
