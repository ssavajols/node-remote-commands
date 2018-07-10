import cheerio from "cheerio";
import fs from "fs";
import request from "sync-request";

export class DemoManager {
  public demos: any = [];

  constructor(serviceUri) {
    this.loadFromService(serviceUri);
  }

  public loadFromService(serviceUri) {
    const demoFileContent = request("GET", serviceUri);

    this.parseDemoContent(demoFileContent.body.toString());
  }

  public getDemoByName(name) {
    return this.demos.filter((d) => d.name === name)[0];
  }

  public loadFromFile() {
    const demoFileContent = fs.readFileSync(__dirname + "/demo-interface.html");
    this.parseDemoContent(demoFileContent);
  }

  public parseDemoContent(demoFileContent) {
    const $ = cheerio.load(demoFileContent);

    $(".table-responsive tr").each((index, content) => {
      const demo: any = {};
      const $name = $(content)
        .find("td")
        .eq(0);
      const $IP = $(content)
        .find("td")
        .eq(2);
      const $STATUS = $(content)
        .find("td")
        .eq(3);

      if (
        $name.text().indexOf("-site") !== -1 ||
        $name.text().indexOf("-xfactori") !== -1
      ) {
        demo.name = $name.text();
        demo.image = `https://placekitten.com/30${index}/20${index}`;
        demo.ip = $IP.text();
        demo.status = $STATUS.text();

        if ($name.text().indexOf("-site") !== -1) {
          demo.hasXSL = false;
          demo.hasTWIG = true;
          demo.hasASSETS = true;
        }

        if ($name.text().indexOf("-xfactori") !== -1) {
          demo.hasXSL = true;
          demo.hasTWIG = false;
          demo.hasASSETS = false;
        }

        this.demos.push(demo);
      }
    });
  }
}
