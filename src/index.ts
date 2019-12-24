import signale from './logger';
signale.info(`script started in '${process.env.NODE_ENV}' mode!`);

// catch all the errors
import './helpers/errorsFallback';

// start graphql server
import server from './server/initServer';

export default server;
