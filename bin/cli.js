#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const runCommand = (command) => {
  try {
    execSync(`${command}`, { stdio: "inherit" });
  } catch (error) {
    console.error(`Failed to execute ${command}`, error);
    return false;
  }
  return true;
};

const deleteFolderRecursive = (folderPath) => {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file, index) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
  }
};

const repoName = process.argv[2] || "NMVT";
const gitCheckoutCommand = `git clone --depth 1 https://github.com/WebNaresh/rmtft.git ${repoName}`;
const installDepsCommand = `cd ${repoName} && yarn install`;
const removeOriginCommand = `cd ${repoName} && git remote remove origin`;

const isWindows = os.platform() === "win32";
const removeGitCommand = isWindows
  ? `cd ${repoName} && rmdir /s /q .git`
  : `cd ${repoName} && rm -rf .git`;

const green = "\x1b[32m";
const yellow = "\x1b[33m";
const blue = "\x1b[34m";
const reset = "\x1b[0m";

console.log(`${green}Cloning the repository with name ${repoName}${reset}`);
const checkedOut = runCommand(gitCheckoutCommand);

if (!checkedOut) {
  process.exit(-1);
} else {
  console.log(installDepsCommand);
  console.log(`${green}Installing dependencies for ${repoName}${reset}`);
  const installedDeps = runCommand(installDepsCommand);

  if (!installedDeps) {
    process.exit(-1);
  }

  // Remove the default "origin" remote
  runCommand(removeOriginCommand);

  if (isWindows) {
    // Windows specific command
    runCommand(removeGitCommand);
  } else {
    // Unix specific command
    const gitFolderPath = path.join(__dirname, repoName, ".git");
    deleteFolderRecursive(gitFolderPath);
  }

  console.log(
    `${yellow}Congratulations! You are ready. Follow the following commands to start${reset}`
  );
  console.log(`cd ${repoName} && yarn dev`);
  console.log(`${blue}\nThank you for using this setup script!${reset}`);
  console.log(
    `${blue}Follow Naresh Bhosale on LinkedIn: https://www.linkedin.com/in/naresh-bhosale-173145265/\n${reset}`
  );
}
