import shell from "shelljs";
import fs from "fs";
import path from "path";
import chalk from "chalk";

// utils
const generateRemoteLinkSsh = (username, projectName) => {
  return `git@github.com:${username}/${projectName}.git`;
};
const generateRemoteLinkHttps = (username, projectName) => {
  return `https://github.com/${username}/${projectName}.git`;
};
const generateRemoteLink = (username, projectName, connectionType) => {
  if (connectionType === "https") {
    return generateRemoteLinkHttps(username, projectName);
  } else {
    return generateRemoteLinkSsh(username, projectName);
  }
};

// Native actions
export const init = () => {
  shell.exec("git init");
};

const addRemote = (name, remote) => {
  shell.exec(`git remote add ${name} ${remote}`);
};

const removeRemote = (name) => {
  shell.exec(`git remote remove ${name}`);
};

const addSubtree = (subtree) => {
  shell.exec(
    `git add ${subtree} && git commit -m "initial ${subtree} subtree commit"`
  );
};

export const addCommitPushMaster = (commitMsg) => {
  shell.exec(
    `git add . && git commit -m "${commitMsg}" && git push origin master`,
    { silent: true }
  );
};

// used mainly for pushing to gh-pages branch
export const pushSubtreeToOrigin = (subtree, branch) => {
  if (branchDoesExistAtOrigin("gh-pages")) {
    console.log("gh-pages already exists at origin");
  }
  shell.exec(`git subtree push --prefix ${subtree} origin ${branch}`);
};

// Custom actions

export const createOrOverrideRemoteOrigin = (
  username,
  projectName,
  connectionType
) => {
  // git init if needed
  if (!hasGitInitialized()) {
    console.log(chalk.cyanBright("Initalizing git..."));
    init();
  }
  // check remotes for existing origin, remove if present
  if (hasRemoteOrigin()) {
    removeRemote("origin");
  }
  // create new remote origin connection
  const remote = generateRemoteLink(username, projectName, connectionType);
  addRemote("origin", remote);
  console.log(chalk.cyanBright("Updated remote connection for 'origin':"));
  console.log(getRemotes());
};

// Viewers
export const getRemotes = () => {
  const { stdout } = shell.exec("git remote -v", { silent: true });
  return stdout;
};

export const hasGitInitialized = () => {
  return fs.existsSync(path.join(process.cwd(), ".git"));
};

export const branchDoesExistAtOrigin = (branch) => {
  const {
    code,
  } = shell.exec(`git ls-remote --exit-code origin "refs/heads/${branch}"`, {
    silent: true,
  });
  return code === 0;
};

export const hasRemoteOrigin = () => {
  const output = getRemotes();
  const pattern = /^origin\s/m;
  return pattern.test(output);
};
