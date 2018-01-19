const request = require('request');
const request_promise = require('request-promise');
const winston = require('winston');

const ProCalculater = require('./ProCalculater.js').ProCalculater;

const requestUrl = 'http://localhost';

class Step{	

	async initialStep(){
		request.get(requestUrl + ':8086/candidate/', async (error, response, body) => {
			if (!error) {
				var candidates = JSON.parse(body);
				console.log(candidates.length);
				for (var i = 0; i < candidates.length; i++) {
					candidates[i].probability = await 1 / candidates.length;
					await request_promise({
						method: 'POST',
						uri: requestUrl + ':8086/init_step/',
						body: candidates[i],
						json: true
					})
					.then(function (parsedBody) {						
						return Promise.resolve(parsedBody);
					})
					.catch(function (err) {
						winston.info(`InitialStep to post action is error : ${err}`);
					});					
				}
			} else {
				winston.info(`InitialStep to request all the actions is error : ${error}`);
			}
		});
	}

	async updateStep(){
		request.get(requestUrl + ':8086/step/', async (error, response, body) => {
			if (!error) {
				var stepArray = await JSON.parse(body);
				var proCalculater = new ProCalculater(stepArray);
				var stepNew = await proCalculater.refreshAllProbability();
				await this.postStepNew(stepNew);				

			} else {
				winston.info(`UpdateStep to request.get all the steps is error : ${error}`);
			}
		});
	}

	async postStepNew(stepNew){
		for (var i = 0; i < stepNew.length; i++) {
			await request_promise({
				method: 'POST',
				uri: requestUrl + ':8086/update_step/',
				body: stepNew[i],
				json: true
			})
			.then(function (parsedBody) {
				return Promise.resolve(parsedBody);
			})
			.catch(function (err) {
				winston.info(`UpdateStep to post UpdateStep is error : ${err}`);
			});
		}
	}

}

module.exports.Step = Step;