const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { exec, execSync } = require('child_process');

const router = express.Router();

router.get('/create', async (req, res) => {
	const instructionJson = {
		FROM: 'ubuntu',
		WORKDIR: '/',
		RUN: 'ls',
		CMD: 'ls',
	};

	const filepath = path.join(__dirname, '../files/dockerfile-1');

	const openFile = async () => {
		try {
			const comment = '# dynamic dockerfile creation';
			await fs.writeFile(filepath, comment);
		} catch (error) {
			console.error(`Got an error trying to write to a file: ${error.message}`);
		}
	};

	const addInstructions = async (instruction, argument) => {
		try {
			const csvLine = `\n${instruction} ${argument}`;
			await fs.writeFile(filepath, csvLine, { flag: 'a' });
		} catch (error) {
			console.error(`Got an error trying to write to a file: ${error.message}`);
		}
	};

	const instructionMap = (obj) => {
		Object.keys(obj).forEach((key) => {
			addInstructions(key, obj[key]);
		});
	};

	const imagename = 'image-1';

	const dockerBuild = async () => {
		exec(
			`docker build -t afif1400/${imagename} -f ${filepath} .`,
			(error, stdout, strerr) => {
				if (error) {
					console.log(`error: ${error.message}`);
				}
				if (stdout) {
					console.log(`stdout: ${stdout}`);
				}
				if (strerr) {
					console.log(`strerr: ${strerr.message}`);
				}
			}
		);
		exec(
			`docker tag  afif1400/${imagename} afif1400/${imagename}`,
			(error, stdout, strerr) => {
				if (error) {
					console.log(`error: ${error.message}`);
				}
				if (stdout) {
					console.log(`stdout: ${stdout}`);
				}
				if (strerr) {
					console.log(`strerr: ${strerr.message}`);
				}
			}
		);
		return 'completed';
	};

	const dockerpush = async (imagename) => {
		exec(`docker push afif1400/${imagename}`, (error, stdout, strerr) => {
			if (error) {
				console.log(`error: ${error.message}`);
			}
			if (stdout) {
				console.log(`stdout: ${stdout}`);
			}
			if (strerr) {
				console.log(`strerr: ${strerr.message}`);
			}
		});
	};

	openFile();
	instructionMap(instructionJson);
	await dockerBuild(filepath);
	await dockerpush(imagename);
	res.send({ message: 'created' });
});

module.exports = router;
