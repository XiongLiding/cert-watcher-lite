import sslChecker from 'ssl-checker'

import type {Host} from './config.mjs'

export interface Cert {
  name: string;
  remark: string;
  success: boolean;
  valid: boolean;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  validFor?: string[];
  onlyDaysMatter: boolean;
}

export async function check(host: Host, options = {}): Promise<Cert> {
  const url = new URL(host.url)

  try {
    const res = await sslChecker(url.hostname, {
      ...options,
      port: url.port || 443
    })

    return {
      ...res,
      success: true,
      name: host.name,
      remark: host.remark,
      onlyDaysMatter: host.onlyDaysMatter || false
    }
  } catch (err) {
    return {
      name: host.name,
      remark: host.remark,
      success: false,
      valid: false,
      validFrom: '',
      validTo: '',
      daysRemaining: 0,
      onlyDaysMatter: host.onlyDaysMatter || false
    }
  }
}

export async function checkAll(hosts: Host[], options = {}) {
  return await Promise.all(hosts.map(host => check(host, options)))
}
