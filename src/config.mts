import fs from 'node:fs/promises'

import chokidar from 'chokidar'
import JSON5 from 'json5'

export interface Host {
  name: string,
  url: string,
  remark: string,
  onlyDaysMatter?: boolean,
}

export interface Config {
  host?: string,
  port?: number,
  hosts: Host[]
}

export async function readConfig(path: string): Promise<Config> {
  const data: string = await fs.readFile(path, 'utf-8')
  return JSON5.parse(data)
}

export async function watchConfig(path: string, callback: (config: Config) => void) {
  chokidar.watch(path, {
    ignoreInitial: true,
    awaitWriteFinish: { // 等待写入完成
      stabilityThreshold: 2000,
      pollInterval: 100
    }
  }).on('change', async () => {
    try {
      const config = await readConfig(path)
      callback(config)
    } catch (error) {
      console.log(error)
    }
  })
}
