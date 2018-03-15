const express = require('express')
const child = require('child_process').spawn
const nunjucks = require('nunjucks')
let commads = loadCommands()

const app = express()
const commandRunning = {}

app.get('/', (req, res) => {
  res.send(nunjucks.render('index.html', {items: commands}))
})

app.get('/log/:command', (req, res) => {
  const cmd = commandRunning[req.params.command]
  
  if ( cmd && cmd.log ) {
    res.send(nunjucks.render('log.html', {log: cmd.log}))
    return
  }
  res.send(req.params.command+' : not running')
})

app.get('/run/:command', (req, res) => {

  let cmd = commandRunning[req.params.command]

  res.redirect('/log/'+req.params.command)

  if( cmd && cmd.isRunning ) {
    return 
  }

  const p = child(commands[req.params.command].command, [], {
    cwd: commands[req.params.command].cwd || process.cwd(),
    shell: true
  }, () => {
    cmd.isRunning = false
  })

  cmd = commandRunning[req.params.command] = {
    log: "started at " + (new Date).toString() + "<br />",
    isRunning: true,
    timer: setTimeout(() => {
      if( p ) {
        p.kill()
      }
    }, 1000 * 60 * 10)
  }

  p.stdout.on('data', (data) => {
    cmd.log += data.toString() + "<br />"
  });
  
  p.stderr.on('data', (data) => {
    cmd.log += data.toString() + "<br />"
  });
  
  p.on('exit', (code) => {
    cmd.isRunning = false
    cmd.log += "finished at " + (new Date).toString() + "<br />" + code + "<br />"
  });

})

app.listen(5001, () => {
  console.log('listening 5001')
})

function loadCommands() {
  return commands = require('./commands.json')
}
