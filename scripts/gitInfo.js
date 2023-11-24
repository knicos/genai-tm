import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const execSyncWrapper = (command) => {
    let stdout = null;
    try {
        stdout = execSync(command).toString().trim();
    } catch (error) {
        console.error(error);
    }
    return stdout;
};

const main = () => {
    let gitBranch = execSyncWrapper('git rev-parse --abbrev-ref HEAD');
    let gitCommitHash = execSyncWrapper('git rev-parse --short=7 HEAD');
    let gitTag = execSyncWrapper('git describe');

    const obj = {
        gitBranch,
        gitCommitHash,
        gitTag,
    };

    const filePath = path.resolve('src', 'generatedGitInfo.json');
    const fileContents = JSON.stringify(obj, null, 2);

    fs.writeFileSync(filePath, fileContents);
    console.log(`Wrote the following contents to ${filePath}\n${fileContents}`);
};

main();
