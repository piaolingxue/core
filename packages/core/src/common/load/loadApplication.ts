import { S_CURRENT } from '../../libs/common';
import {
  downloadComponent,
  generateComponentPath,
  IComponentPath,
  installAppDependency,
  RegistryEnum,
  Registry,
  getGithubReleases,
  getGithubReleasesLatest,
} from './service';
import * as config from '../../libs/handler-set-config';
import { downloadRequest } from '../request';

async function loadServerless(source: string) {
  if (!source.includes('/')) return;
  const [provider, componentName] = source.split('/');
  if (!componentName) return;
  const [name, version] = componentName.split('@');
  const baseArgs = { name, version, provider };
  const componentPaths: IComponentPath = await generateComponentPath(baseArgs, S_CURRENT);
  const { applicationPath } = componentPaths;
  await downloadComponent(applicationPath, { name, provider });
  await installAppDependency(applicationPath);
  return true;
}

async function loadGithub(source: string) {
  if (!source.includes('/')) return;
  const [user, componentName] = source.split('/');
  if (!componentName) return;
  const [name, version] = componentName.split('@');
  let zipball_url: string;
  let componentPath: string;
  if (version) {
    const result = await getGithubReleases(user, name);
    const findObj = result.find((item) => item.tag_name === version);
    if (!findObj) return;
    zipball_url = findObj.zipball_url;
    componentPath = `${S_CURRENT}/${componentName}`;
  } else {
    const result = await getGithubReleasesLatest(user, name);
    zipball_url = result.zipball_url;
    componentPath = `${S_CURRENT}/${componentName}`;
  }
  await downloadRequest(zipball_url, componentPath, {
    extract: true,
    strip: 1,
  });
  return true;
}

async function loadType(source: string, registry?: Registry) {
  if (registry === RegistryEnum.serverless) {
    return await loadServerless(source);
  }
  if (registry === RegistryEnum.github) {
    return await loadGithub(source);
  }
}

async function tryfun(f: Promise<any>) {
  try {
    return await f;
  } catch (error) {
    // ignore error
  }
}

async function loadApplication(source: string, registry?: Registry) {
  // gui
  if ((process.versions as any).electron) {
    let result: any;
    if (registry) {
      result = await tryfun(loadType(source, registry));
      if (result) return;
    }
    if (config.getConfig('registry')) {
      result = await tryfun(loadType(source, config.getConfig('registry')));
      if (result) return;
    }
    result = await tryfun(loadServerless(source));
    if (result) return;
    await tryfun(loadGithub(source));
  } else {
    // cli
    let result: any;
    if (registry) {
      result = await tryfun(loadType(source, registry));
      if (result) return;
    }
    if (config.getConfig('registry')) {
      result = await tryfun(loadType(source, config.getConfig('registry')));
      if (result) return;
    }
    result = await tryfun(loadGithub(source));
    if (result) return;
    await tryfun(loadServerless(source));
  }
}

export default loadApplication;
