const fsWrite = require("fs").writeFile;
const { Observable } = require("rxjs");
const process = require('process');

module.exports = function(ctx)
{
  if (process.env.DEVELOP_CLOUD_URL === undefined  || process.env.STAGING_CLOUD_URL === undefined ||
      process.env.MASTER_CLOUD_URL === undefined) {
    return;
  }

  const pathDevelop = "./src/environments/develop.ts";
  const pathStaging = "./src/environments/staging.ts";
  const pathWeb     = "./src/environments/www.ts";
  let exec = require("child_process").exec;
  const revision = new Observable(s =>
  {
    exec("git rev-parse HEAD", function(error, stdout, stderr)
    {
      if (error !== null) console.log("git error: " + error + stderr);
      s.next(stdout.toString().trim());
      s.complete();
    });
  });
  revision.subscribe(function(res)
  {
    const envDevelop = `export const environment =
      {
        apiUrl:     "${process.env.API_DEVELOP_URL}",
        cloudUrl:   "${process.env.DEVELOP_CLOUD_URL}deployments/${res}/assets",
        pusherApiKey: "9882622c8c5e8991b976",
        pusherCluster: "us2",
        production: "false",
        gitSha:     "${res}",
        envName: 'develop',
        stripeAPIKey: "pk_test_Bux6mSBRhF7WHonHROH37OAR00pMgldwhb"
      };
    `;
    const envStaging = `export const environment =
      {
        apiUrl:     "${process.env.API_STAGING_URL}",
        cloudUrl:   "${process.env.STAGING_CLOUD_URL}deployments/${res}/assets",
        pusherApiKey: "",
        pusherCluster: "us2",
        production: "false",
        envName: 'staging',
        gitSha:     "${res}",
        stripeAPIKey: "pk_test_Bux6mSBRhF7WHonHROH37OAR00pMgldwhb"
      };
    `;
    const envWeb = `export const environment =
      {
        apiUrl:     "${process.env.API_URL}",
        cloudUrl:   "${process.env.MASTER_CLOUD_URL}deployments/${res}/assets",
        pusherApiKey: "82ac4cd7763cb37f7226",
        pusherCluster: "us2",
        production: "true",
        gitSha:     "${res}",
        envName: 'production',
        stripeAPIKey: "pk_live_51I1dvrC5iJevKSWRcTbYqLAlI2xivWhj3IOWtvedJxFEhYNWhuIBce4ZcDkS9k4hbZhNggVJ1k0s5PkLKyiZfkBp008xj3l18m"
      };
    `;
    fsWrite(pathDevelop, envDevelop, function (err)
    {
      if (err) {
        throw console.error(err);
      } else {
        console.log({envDevelop});
      }
    });
    fsWrite(pathStaging, envStaging, function (err)
    {
      if (err) {
        throw console.error(err);
      } else {
        console.log({envStaging});
      }
    });
    fsWrite(pathWeb, envWeb, function (err)
    {
      if (err) {
        throw console.error(err);
      } else {
        console.log({envWeb});
      }
    });
  });
};
