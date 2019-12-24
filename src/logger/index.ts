import fs from 'fs';
import path from 'path';
import moment from 'moment';
import { Signale, SignaleOptions } from 'signale';

const logsDir = path.join(__dirname, '..', '..', 'logs');
const logFileName = `${moment().format('YYYY-MM-DD HH.mm.ss.SSS')}.log`;

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

let signale = new Signale();
if (process.env.WRITE_CUSTOM_LOG_TO_FILE === 'yes') {
  const streamLog = fs.createWriteStream(path.join(logsDir, logFileName), {
    flags: 'w',
  });

  const options: SignaleOptions = {
    // @ts-ignore
    stream: [process.stdout, streamLog],
  };
  signale = new Signale(options);
}

signale.config({
  displayFilename: true,
  displayTimestamp: true,
  displayDate: true,
});

export default signale;
