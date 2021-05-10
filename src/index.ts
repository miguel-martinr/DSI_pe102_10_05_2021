import * as express from 'express';
import { spawn } from 'child_process';


type CmdType = {
  cmd: string,
  args?: string[],
};

const app = express();


app.get('/execmd', (req, res) => {
  console.log(req.query);

  if (!req.query.cmd) {
    res.send({
      error: 'A command must be provided!',
    });
  } else {
    let args: string[] = [];
    if (typeof req.query.args === 'string') args = req.query.args.split(/\s+/);
  
    const cmd = {cmd: req.query.cmd.toString(), args: args};
    execCmd(cmd, (err, output) => {
      if (err) {
        res.send({
          error: err,
        });
      } else {
        res.send({
          output: output,
        });
      }
    });
  }

});


app.get('*', (_, res) => {
  res.send('<h1>404 Page not found :(</h1>');
});


app.listen(3000, () => {
  console.log('Server is up on port 3000');
});

const execCmd = (executingCmd: CmdType, cb: (error: string | undefined, output: string | undefined) => void) => {
  const cmd = spawn(executingCmd.cmd, executingCmd.args);

  let err: Error;
  cmd.on('error', (error) => {
    err = error;
  });

  let cmdOutput = '';
  cmd.stdout.on('data', (chunk) => cmdOutput += chunk);
  
  let cmdErr = '';
  cmd.stderr.on('data', (chunk) => cmdErr += chunk);

  cmd.on('close', () => {
    if (err) {
      cb(`Could not execute command: ${err.message}`, undefined);
    } else if (cmdErr) {
      cb(`Error while executing command. ${cmdErr}`, undefined);
    } else {
      cb(undefined, cmdOutput);
    }
  });
};
