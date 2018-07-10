import { spawn as child } from "child_process";
import express from "express";
import nunjucks from "nunjucks";
import { DemoManager } from "./demoManager/DemoManager";

const { script_path, scripts, html_demo_uri } = require("./config.json");
const demoManager = new DemoManager(html_demo_uri);

const app = express();
const commandRunning = {};

app.get("/", (req, res) => {
  res.send(nunjucks.render("index.html", { items: demoManager.demos }));
});

app.get("/log/:type/:command", (req, res) => {
  const commandName = req.params.type + req.params.command;
  const cmd = commandRunning[commandName];

  if (cmd && cmd.log) {
    res.send(nunjucks.render("log.html", { log: cmd.log }));
    return;
  }
  res.send(req.params.type + " / " + req.params.command + " : not running");
});

app.get("/run/:type/:command", (req, res) => {
  const type = commandRunning[req.params.type];
  const cmd = commandRunning[req.params.command];
  const commandName = req.params.type + req.params.command;
  const script = scripts[req.params.type];

  res.redirect("/log/" + req.params.type + "/" + req.params.command);

  if (cmd && cmd.isRunning) {
    return;
  }

  const p = child(script, [demoManager.getDemoByName(req.params.command).ip], {
    cwd: script_path,
  });

  commandRunning[commandName] = {
    isRunning: true,
    log: "started at " + new Date().toString() + "<br />",
    timer: setTimeout(() => {
      if (p) {
        p.kill();
      }
    }, 1000 * 60 * 10),
  };

  p.stdout.on("data", (data) => {
    commandRunning[commandName].log += data.toString() + "<br />";
  });

  p.stderr.on("data", (data) => {
    commandRunning[commandName].log += data.toString() + "<br />";
  });

  p.on("exit", (code) => {
    commandRunning[commandName].isRunning = false;
    commandRunning[commandName].log +=
      "finished at " + new Date().toString() + "<br />" + code + "<br />";
  });
});

app.listen(5001, () => {
  console.log("listening 5001");
});
