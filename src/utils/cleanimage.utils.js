import fs from 'fs';
import path from 'path';
import cron from 'node-cron';

const __dirname = path.resolve();

const cleanupImages = () => {
  const directory = path.join(__dirname, 'uploads');
  const expirationDays = 1; 
  const expirationTime = Date.now() - expirationDays * 24 * 60 * 60 * 1000;

  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    files.forEach(file => {
      const filePath = path.join(directory, file);
      fs.stat(filePath, (err, stats) => {
        if (err) throw err;

        if (stats.mtimeMs < expirationTime) {
          fs.unlink(filePath, (err) => {
            if (err) throw err;
            console.log(`Eliminado: ${file}`);
          });
        }
      });
    });
  });
};

cron.schedule('0 0 * * *', cleanupImages);