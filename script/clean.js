'use strict';

const fs = require('fs');

if (fs.existsSync(process.cwd() + '/lib')) {
    fs.rmSync(process.cwd() + '/lib', {recursive: true});
}
