const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');

const router = express.Router();

/**
 *  @swagger
 * 
 * 
 *  /dockerfile/create:
 *    post:
 *      summary: create image
 *      description: create a new image and push it to docker hub
 *      consumes:
 *       - application/json
 *      parameters:
 *       - name: instructions
 *         description: enter the dockerfile instructions
 *         type: object
 *         in: body
 *      responses:
 *        201:
 *          description: Image Created
 *        421:
 *          description: Image cannot be built
 *        422:
 *          description: Image cannot be pushed

 */
router.post('/create', (req, res) => {
	const instructions = req.body;
	
	const filepath = path.join(__dirname, '../files/dockerfile-1');

	const openFile = async () => {
		try {
			const comment = '# dynamic dockerfile creation';
			await fs.writeFile(filepath, comment);
		} catch (error) {
			console.error(`Got an error trying to write to a file: ${error.message}`);
		}
	};

	const addInstructions = (instruction, argument) => new Promise((resolve, reject) => {
		try {
			const instructionLine = `\n${instruction} ${argument}`;
			fs.writeFile(filepath, instructionLine, { flag: 'a' }, (error) => {
				if (!error) resolve();
				else reject(error);
			});
		} catch (error) {
			console.error(`Got an error trying to write to a file: ${error.message}`);
		}
	});

	const instructionMap = (obj) => {
		let string = ""
		Object.keys(obj).forEach(async (key) => {
			string = string + `\n${key} ${obj[key]}`
		});
		console.log(string)
		fs.writeFileSync(filepath, string)
	};

	const imagename = 'image-2';

	const dockerBuild = async () => {
		const promise1 = new Promise((resolve, reject) => {
			exec(
				`docker build -t dgshivu/${imagename} -f ${filepath} .`,
				(error, stdout, strerr) => {
					if (error) {
						console.log(`error: ${error.message}`);
						reject(error.message);
					}
					if (stdout) {
						console.log(`stdout: ${stdout}`);
						resolve(stdout);
					}
					if (strerr) {
						console.log(`strerr: ${strerr}`);
						// reject(strerr);
					}
				}
			);
		});

		return promise1;
	};

	const dockerTag = async (imagename) => {
		const promise2 = new Promise((resolve, reject) => {
			exec(
				`docker tag  dgshivu/${imagename} dgshivu/${imagename}`,
				(error, stdout, strerr) => {
					if (error) {
						console.log(`error: ${error.message}`);
						reject(error.message)
					}
					if (stdout) {
						console.log(`stdout: ${stdout}`);
						resolve(stdout)
					}
					if (strerr) {
						console.log(`strerr: ${strerr.message}`);
						// reject(stderr)
					}
				}
			);
		});
		return promise2;
	};

	const dockerpush = async (imagename) => {
		const promise3 = new Promise((resolve, reject) => {
			exec(`docker push dgshivu/${imagename}`, (error, stdout, strerr) => {
				if (error) {
					console.log(`error: ${error.message}`);
					reject(error);
				}
				if (stdout) {
					console.log(`stdout: ${stdout}`);
					resolve(stdout);
				}
				if (strerr) {
					console.log(`strerr: ${strerr.message}`);
					// reject(strerr);
				}
			});
		});
		return promise3;
	};

	openFile();
	instructionMap(instructions);
	dockerBuild(filepath)
		.then(() => {
			dockerTag(imagename);
		})
		.then((result) => {
			dockerpush(imagename)
				.then((resultPush) => {
					res.status(201).json({
						message: 'created',
						buildOutput: result,
						pushOutput: JSON.stringify(resultPush),
					});
				})
				.catch((e) => {
					res
						.status(421)
						.json({
							message: 'error pushing image to docker hub',
							errorMessage: e,
						});
				});
		})
		.catch((e) => {
			res
				.status(422)
				.json({ message: 'error building the image', errorMessage: e });
		});
});

module.exports = router;
