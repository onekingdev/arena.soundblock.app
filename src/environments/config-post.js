const fsWrite = require('fs').writeFile;
const fsRead = require('fs').readFile;
const fsCopyFile = require('fs').copyFile;
const { Observable } = require('rxjs');
const exec = require('child_process').exec;
const process = require('process');

module.exports = () => {
  if (process.env.CURRENT_CLOUD_URL === undefined) {
    return;
  }
  const revision = new Observable(s => {
    exec('git rev-parse HEAD', (shaError, shaStdout, shaStderr) => {
      if (shaError !== null) {
        console.log('git error: ' + shaError + shaStderr);
      }

      s.next(shaStdout.toString().trim());
      s.complete();
    });
  });

  revision.subscribe(function(res) {
    console.log(res);

    fsCopyFile('./src/favicon.ico', './www/favicon.ico', (copied) => {
      console.log(copied)
    });

    const indexPath = './www/index.html';
    const pluginsPath = "./www/cordova_plugins.js";
    const runtimeFiles = [];
    const cordovaFiles = [];

    fsRead(indexPath, (err, fileContent) => {
      if (err) {
        console.error(err);
        throw err;
      }

      let strFileContent = fileContent.toString();


      let runtimeResult;
      const runtimeRegexp = new RegExp(/src="(runtime.+?\.js)"/g);

      while (runtimeResult = runtimeRegexp.exec(strFileContent)) {
        runtimeFiles.push("./www/" + runtimeResult[1]);
      }

      let cordovaResult;
      const cordovaRegexp = new RegExp(/src="(cordova.+?\.js)"/g);

      while (cordovaResult = cordovaRegexp.exec(strFileContent)) {
        cordovaFiles.push("./www/" + cordovaResult[1]);
      }

      const regexp = RegExp(/(src|rel=".+?[stylesheet|icon]+".+?href)\s*=\s*"(.+?)"/g);

      let result;

      while (result = regexp.exec(strFileContent)) {
        if (result[2].search(/http.+/) === 0) {
          continue;
        }

        const assetName = result[2].replace(/\.\//, '');
        const assetScriptBody = result[0].replace(result[2], process.env.CURRENT_CLOUD_URL + `deployments/${res}/` + assetName);
        strFileContent = strFileContent.replace(result[0], assetScriptBody);
      }

      strFileContent = strFileContent.replace(/<script.+?><\/body>/g, (match) => {
        return '\t' + match;
      });

      strFileContent = strFileContent.replace(/<\/.+?></g, (match) => {
        return match.slice(0, -1) + '\r\n\t' + match.slice(-1);
      });

      strFileContent = strFileContent.replace(/\n\t<script/g, (match) => {
        return match.replace(/\n\t/g, "\n\t\t");
      });

      strFileContent = strFileContent.replace(/\xa0{2}<script.+?><\/script>/g, (match) => {
        return '\t' + match;
      });

      strFileContent = strFileContent.replace(/^\s{4}<link rel="stylesheet".+?>/gm, (match) => {
        return '\t' + match + '\r\n\t';
      });

      strFileContent = strFileContent.replace(/nomodule/g, 'type="nomodule"');

      fsWrite("./www/index.html", strFileContent, (err) => {
        if (err) {
          throw console.error(err);
        }
      });


      fsRead(pluginsPath, (err, pluginsFileContent) => {
        let pluginsStrContent = pluginsFileContent.toString();

        pluginsStrContent = pluginsStrContent.replace(/"file": "(.+)"/g, (fullMatch, match) => {
          return `"file": "${process.env.CURRENT_CLOUD_URL}deployments/${res}/${match}"`;
        });

        fsWrite(pluginsPath, pluginsStrContent, (err) => {
          if (err) {
            throw console.error(err);
          }
        });
      });

      cordovaFiles.forEach((fileName) => {
        const cordovaHash =  fileName.match(/.*cordova\.(.+).js/)[1];

        fsRead(fileName, (err, cordovaFileContent) => {
          let cordovaString = cordovaFileContent.toString();

          cordovaString = cordovaString.replace(/\/cordova\.js/g, (match) => {
            const arrCordovaMatch = match.split(".");
            match = `${arrCordovaMatch[0]}.${cordovaHash}.${arrCordovaMatch[1]}`;
            return `${process.env.CURRENT_CLOUD_URL}deployments/${res}${match}`;
          });

          cordovaString = cordovaString.replace(/[a-z]*\+"cordova_plugins\.js"/g, (match) => {
            return `"${process.env.CURRENT_CLOUD_URL}deployments/${res}/cordova_plugins.js"`;
          });

          cordovaString = cordovaString.replace(/e\+n\[i]\.file/g, "n[i].file");

          fsWrite(fileName, cordovaString, (err) => {
            if (err) {
              throw console.error(err);
            }
          });
        });
      });

      runtimeFiles.forEach((fileName) => {
        fsRead(fileName, (err, runtimeFileContent) => {
          let runtimeString = runtimeFileContent.toString();

          runtimeString = runtimeString.replace(/\.src=function/g, (match) => {
            console.log(match);
            return `.src = "${process.env.CURRENT_CLOUD_URL}deployments/${res}/" + function`;
          });
          fsWrite(fileName, runtimeString, (err) => {
            if (err) {
              throw console.error(err);
            }
          });
        });
      })
    });
  });
}
