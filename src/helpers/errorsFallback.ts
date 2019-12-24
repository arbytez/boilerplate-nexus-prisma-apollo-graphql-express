import signale from '../logger';

import photon from '../server/photon';

// catch all the unmanaged errors and stop script
process.on('uncaughtException', async err => {
  signale.fatal(err);
  try {
    await photon.disconnect();
  } catch (error) {
    signale.error(error);
  }
  process.exit(1);
});

process.on('unhandledRejection', async err => {
  signale.fatal(err);
  try {
    await photon.disconnect();
  } catch (error) {
    signale.error(error);
  }
  process.exit(1);
});
