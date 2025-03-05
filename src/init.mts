import fs from 'node:fs'
import path from 'node:path'
import sea from 'node:sea'

const configFileContent = `{
  "host": "0.0.0.0",
  "port": "2378",
  "hosts": [{
    "name": "Github",
    "url": "https://www.github.com",
    "remark": "https://www.github.com"
  }]
}`;

const systemdFileContent = `[Unit]
[Unit]
Description=Cert Watcher Service
After=network.target

[Service]
Restart=on-failure
RestartSec=5s
WorkingDirectory=${path.dirname(process.execPath)}
ExecStart=${process.execPath}

[Install]
WantedBy=multi-user.target
`

export async function init(dir: string) {
  const config = path.join(dir, 'config.json5');
  const isExist = fs.existsSync(config);
  if (isExist) {
    console.log('配置文件 config.json5 已经存在，跳过')
  } else {
    fs.writeFileSync(config, configFileContent, {encoding: 'utf-8'});
    console.log('配置文件 config.json5 生成成功')
  }

  const widget = path.join(dir, 'widget.html');
  const isWidgetExist = fs.existsSync(widget);
  if (isWidgetExist) {
    console.log('小组件文件 widget.html 已经存在，跳过')
  } else {
    const widgetFileContent = sea.isSea() ? sea.getAsset('widget.html', 'utf-8') : fs.readFileSync(path.join(dir, 'assets/widget.html'))
    fs.writeFileSync(widget, widgetFileContent, { encoding: 'utf-8' })
    console.log('小组件文件 widget.html 生成成功')
  }

  const systemd = path.join(dir, 'cwl.service');
  fs.writeFileSync(systemd, systemdFileContent, { encoding: 'utf-8' })
  console.log('服务文件 wcl.service 生成成功')
  return true;
}
