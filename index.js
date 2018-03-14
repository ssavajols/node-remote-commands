const express = require('express')
const child = require('child_process').spawn
const nunjucks = require('nunjucks')
let commads = loadCommands()

const app = express()

app.get('/', (req, res) => {

  res.send(nunjucks.render('index.html', {items: commands}))
})

app.get('/run/:command', (req, res) => {

  const p = child(commands[req.params.command].command, [], {
    cwd: commands[req.params.command].cwd || process.cwd(),
    shell: true
  })

  p.stdout.on('data', (data) => {
    res.write(data.toString());
  });
  
  p.stderr.on('data', (data) => {
    res.write(data.toString());
  });
  
  p.on('exit', (code) => {
    res.end(`Child exited with code ${code}`);
  });

})

app.listen(5001, () => {
  console.log('listening 5001')
})

function loadCommands() {
  return commands = require('./commands.json')
}