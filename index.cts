const fs = require('node:fs/promises')
const path = require('node:path')
const sea = require('node:sea')

const Fastify = require('fastify')

const {readConfig} = require('./src/config.mts')
const {checkAll} = require('./src/checker.mts')
const {init} = require('./src/init.mts')

import type {FastifyReply, FastifyRequest} from 'fastify'
import type {Cert} from './src/checker.mts'
import type {Host} from './src/config.mts'

// 需要监听的主机
let hosts: Host[] = []

// 证书校验结果
let data: Cert[] = []

const dirname = sea.isSea() ? path.dirname(process.execPath) : __dirname

;(async function () {
  if (process.argv[2] === 'init') {
    await init(dirname)
    return;
  }

  if (process.argv[2]) {
    console.log(`无法识别的参数 ${process.argv[2]}，退出`)
    return;
  }

  // 监控配置文件，修改后立即更新清单并更新证书信息
  const configFile = path.join(dirname, 'config.json5')

  const fastify = Fastify({
    logger: true
  })

  fastify.get('/api/status.json', async function (request: FastifyRequest, reply: FastifyReply) {
    reply.header('Content-Type', 'application/json')
    const res = [...data]
    res.sort((a, b) => {
      const ar = !a.valid && !a.onlyDaysMatter
      const br = !b.valid && !b.onlyDaysMatter
      if (ar && !br) {
        return -1
      }
      if (!ar && br) {
        return 1
      }
      return a.daysRemaining - b.daysRemaining
    })
    return res
  })

  fastify.get('/widget', async function (request: FastifyRequest, reply: FastifyReply) {
    reply.header('Content-Type', 'text/html')
    return await fs.readFile(path.join(dirname, 'widget.html'))
  })

  const config = await readConfig(configFile)
  hosts = config.hosts;
  data = await checkAll(hosts, {timeout: 5000})

  // 定时器，每一个整点检查一次证书信息
  const offset = new Date().getTime() % 3600
  setTimeout(async () => {
    data = await checkAll(hosts)
    setInterval(async () => {
      data = await checkAll(hosts)
    }, 3600000)
  }, 3600000 - offset)

  fastify.listen({
    host: config.host || '0.0.0.0',
    port: config.port || 2378
  }, function (err: Error | null, address: string) {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
    fastify.log.info(`server listening on ${address}`)
  })
})()
