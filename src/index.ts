import * as csv from "fast-csv";
import getHtml from "./service/helpers/get-html";
import { projectNumbers } from "./service/project/projects";
import getProjectDetails from "./service/project/scrape/get-project-details";
import delay from "./utils/delay";

import fs from "fs";
import { writeToPath } from "fast-csv";
import path from "path";
const csvStream = csv.format({ headers: true });

const start = async () => {
  const data = [];

  for (const projectNr of projectNumbers) {
    await delay(3000);
    const html = await getHtml(
      `https://crowdestor.com/en/projects/details/${projectNr}`
    );

    data.push({ ...(await getProjectDetails(html)), projectNr });

    console.log(projectNr);
  }

  writeToPath(path.resolve(__dirname, "tmp.csv"), data, { headers: true })
    .on("error", (err) => console.error(err))
    .on("finish", () => console.log("Done writing."));
};

start();
