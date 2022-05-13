import { execCommand } from '../../src'

(async () => {
    const data = await execCommand({
        syaml: '/Users/shihuali/workspace/a/start-fc-http-nodejs14/s.yaml',
        args: ['-y', '--use-local'],
        env: {
            serverless_devs_log_path: '/Users/shihuali/workspace/core/test/fs.log',
            // serverless_devs_log_debug: 'false',
        },
        method: 'plan'
    })
    console.log(data)


})()
