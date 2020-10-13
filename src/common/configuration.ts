/* eslint-disable security/detect-object-injection, camelcase */
import { readFileSync } from "fs";
import * as path from "path";

require("dotenv").config();

export interface Configuration {
  port: number;
  host: string;
  database_url: string;
  ci: string;
  sentry_dns: string;
  env_config_test: string;
  env_not_included_config_test: string;
  default_config_test: string;
  local_config_test: string;
  environment_config_test: string;

  /**
   * Bot configuration
   */

  bot_token: string;

  html_fetch_timeout: number;
  scraper_api_key: string;

  /**
   * Worker settings
   */
  worker_max_stalled_count: number;

  environment: string;
  isProduction: boolean;
  isStaging: boolean;
  isDevelopment: boolean;
  isTest: boolean;
  isLocal: boolean;
}

// eslint-disable-next-line import/no-mutable-exports
let configuration: Configuration = null;

const envsToInclude = [
  "api_token",
  "ci",
  "env_config_test",
  "google_service_account_email",
  "google_spreadsheet_service_private_key",
  "host",
  "port",
  "sentry_dns",
  "scraper_api_key",
  "html_fetch_timeout",
  "worker_max_stalled_count",
  "bot_token",
];

function readJson(readPath: string) {
  try {
    const data = readFileSync(readPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (
      error.code !== "ENOENT" ||
      (error.errno !== -4058 && error.errno !== -2)
    ) {
      throw error;
    }
  }
  return {};
}

function read(file: string): Configuration {
  const filePath = path.resolve(
    __dirname,
    "..",
    "..",
    "config",
    `${file}.json`
  );
  return readJson(filePath);
}

function assignEnvironment(config: any) {
  const newConfig = config;
  envsToInclude.forEach((key) => {
    const lc = key.toLowerCase();
    const uc = key.toUpperCase();
    newConfig[lc] = process.env[uc] || config[lc];
  });
  return newConfig;
}

function loadEnvironmentSpecific(config: Configuration, environment: string) {
  let newConfig = config;
  if (environment) {
    const conf = read(environment);
    if (conf) {
      newConfig = {
        ...newConfig,
        ...conf,
      };
    }
  }
  return newConfig;
}

const ensureInteger = (
  fields: (keyof Configuration)[],
  config: Configuration
) =>
  fields.forEach((field) => {
    const value = config[field];
    if (typeof value === "string") {
      // eslint-disable-next-line no-param-reassign
      config[field] = parseInt(value, 10) as never;
    }
  });

const isTrue = (value: any) =>
  [true, "true", "1", "True", "yes", "Yes"].indexOf(value) > -1;

function load() {
  const nodeEnvironment = process.env.NODE_ENV;

  // load default config
  let config = read("default");

  // load local config
  config = loadEnvironmentSpecific(config, "local");

  // load environment specific config
  config = loadEnvironmentSpecific(config, nodeEnvironment);

  // load config from env variables
  config = assignEnvironment(config);

  config.environment = nodeEnvironment || "local";
  config.isProduction = nodeEnvironment === "production";
  config.isStaging = nodeEnvironment === "staging";
  config.isDevelopment = nodeEnvironment === "development";
  config.isTest = nodeEnvironment === "test";
  config.isLocal = !nodeEnvironment;

  config.ci = config.ci || process.env.CIRCLECI;

  const intFields: (keyof Configuration)[] = ["worker_max_stalled_count"];
  ensureInteger(intFields, config);

  return config;
}

export function get() {
  if (!configuration) {
    configuration = load();
  }
  return configuration;
}

export function getKnexConfig() {
  const config = get();
  return {
    client: "pg",
    connection: config.database_url,
    debug: false,
  };
}

if (!configuration) {
  configuration = load();
}

export default configuration;
