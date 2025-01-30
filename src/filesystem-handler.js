import fs from 'fs';

/**
 * Create a directory if not exists, with a dry run option to skip the creation
 * @param {string} directoryPath
 * 
 * @param {boolean} isDryRun stop the process before creating the directory
 * @returns {void}
 * @example
 * mkdir('path/to/dir', false) //create the directory
 * mkdir('path/to/dir', true) //dry run, do not create the directory
 */
function mkdir(directoryPath, isDryRun) {
    if (!fs.existsSync(directoryPath)) {
        if (isDryRun) {
            console.log(`dry run: skipping creating dir ${directoryPath}`);
        } else {
            fs.mkdirSync(directoryPath, { recursive: true });
            console.log(`creating dir ${directoryPath}`);
        }
    }
}

export { mkdir };