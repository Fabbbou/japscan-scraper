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

export default config;