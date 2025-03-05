import fs from 'node:fs/promises'

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
