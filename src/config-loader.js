import fs from 'fs';
import yaml from 'js-yaml';

const configPath = 'config.yml';

// Stop process if config file is not found
if (!fs.existsSync(configPath)) {
  console.error(`${configPath} not found`);
  console.error('please create a config.yml file following example_config.yml structure');
  process.exit(1);
}

// Read a config yaml file
const config = yaml.load(fs.readFileSync(configPath));

if(!config) {
  console.error('config not found, check if the file exists in src/config-loader.js');
  process.exit(1);
}else if (config.debug){
  console.log('debug mode enabled');
  console.log("Config loaded:", config);
}

// Check if the config file has all the required fields
if(config.startAtChapter == "undefined" ||
  config.startAtChapter == null ||
  config.startAtChapter.trim() == ""){
    config.startAtChapter = null;
  }
  else{
  config.startAtChapter = config.startAtChapter.trim();
}

if(config.endAtChapter == "undefined" ||
  config.endAtChapter == null ||
  config.endAtChapter.trim() == ""){
    config.endAtChapter = null;
  }
  else{
  config.endAtChapter = config.endAtChapter.trim();
}

export default config;