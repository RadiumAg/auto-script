import path from 'path';
import shell from 'shelljs';

shell.cp(
  path.resolve(__dirname, '../src/main/auto-script/chromedriver.exe'),
  path.resolve(__dirname, '../shopped-win32-x64/resources/app/dist/main'),
);

shell.cp(
  path.resolve(__dirname, '../src/main/app.config.json'),
  path.resolve(__dirname, '../shopped-win32-x64/resources/app/dist/main'),
);
