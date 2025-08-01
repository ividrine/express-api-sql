#!/usr/bin/env node

import util from "util";
import fs from "fs";
import path from "path";
import * as child_process from "node:child_process";

// Utility functions
const exec = util.promisify(child_process.exec);

async function runCmd(command) {
  try {
    const { stdout, stderr } = await exec(command);
    console.log(stdout);
    console.log(stderr);
  } catch {
    (error) => {
      console.log(error);
    };
  }
}

async function hasPnpm() {
  try {
    await exec("pnpm --version");
    return true;
  } catch {
    return false;
  }
}

// Validate arguments
if (process.argv.length < 3) {
  console.log("Please specify the target project directory.");
  console.log("For example:");
  console.log("    npx create-nodejs-app my-app");
  console.log("    OR");
  console.log("    npm init nodejs-app my-app");
  process.exit(1);
}

// Define constants
const ownPath = process.cwd();
const folderName = process.argv[2];
const appPath = path.join(ownPath, folderName);
const repo = "https://github.com/ividrine/modern-express-api-sql.git";

// Check if directory already exists
try {
  fs.mkdirSync(appPath);
} catch (err) {
  if (err.code === "EEXIST") {
    console.log(
      "Directory already exists. Please choose another name for the project."
    );
  } else {
    console.log(err);
  }
  process.exit(1);
}

async function setup() {
  try {
    // Clone repo
    console.log(`Downloading files from repo ${repo}`);
    await runCmd(`git clone --depth 1 ${repo} ${folderName}`);
    console.log("Cloned successfully.");
    console.log("");

    // Change directory
    process.chdir(appPath);

    // Install dependencies
    const usePnpm = await hasPnpm();
    console.log("Installing dependencies...");
    if (usePnpm) {
      await runCmd("yarn install");
    } else {
      await runCmd("npm install");
    }
    console.log("Dependencies installed successfully.");
    console.log();

    // Copy envornment variables
    fs.copyFileSync(
      path.join(appPath, ".env.example"),
      path.join(appPath, ".env")
    );
    console.log("Environment files copied.");

    // Delete .git folder
    await runCmd("npx rimraf ./.git");

    // Remove extra files
    fs.unlinkSync(path.join(appPath, "bin", "createApp.js"));
    fs.rmdirSync(path.join(appPath, "bin"));
    if (!usePnpm) {
      fs.unlinkSync(path.join(appPath, "pnpm-lock.yaml"));
    }

    console.log("Installation is now complete!");
    console.log();

    console.log("We suggest that you start by typing:");
    console.log(`    cd ${folderName}`);
    console.log(usePnpm ? "    pnpm dev" : "    npm run dev");
    console.log();
    console.log(
      "Enjoy your production-ready Node.js app, which already supports a large number of ready-made features!"
    );
    console.log("Check README.md for more info.");
  } catch (error) {
    console.log(error);
  }
}

setup();
