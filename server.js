const express = require('express');
const dockerfileActions = require('./routes/dockerfileActions');

const app = express();

app.use('/dockerfile', dockerfileActions);

app.listen(5000, () => {
	console.log('running on port 5000');
});
