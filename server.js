const express = require('express');
const dockerfileActions = require('./routes/dockerfileActions');
const swaggerjsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const bodyParser = require('body-parser');

const app = express();

const swaggerOptions = {
	swaggerDefinition: {
		info: {
			title: 'Image management service',
			verison: '1.0.0',
		},
	},
	apis: ['./routes/dockerfileActions.js'],
};

const swaggerDocs = swaggerjsDoc(swaggerOptions);

app.use(bodyParser.json());
app.use('/dockerfile', dockerfileActions);
app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.listen(5000, () => {
	console.log('running on port 5000');
});
