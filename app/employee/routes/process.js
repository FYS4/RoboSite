'use strict';

const express = require('express');
const Session = require('../../customer/models/session');

const router = express.Router();

function eachWorker(cluster, callback) {
	for (const id in cluster.workers) {
		callback(cluster.workers[id]);
	}
}

function restartWorker(cluster, workerId) {
	if (typeof cluster.workers[workerId] !== 'undefined' && cluster.workers[workerId]) {
		cluster.workers[workerId].send({
			text: 'shutdown',
			from: 'master'
		});

		if (cluster.workers[workerId]) {
			cluster.workers[workerId].kill('SIGKILL');
		}
	}
}

router.get('/', (req, res, next) => {
	process.nextTick(() => {
		let RenderObject = {};
		const cluster = Object.assign(req.app.cluster, {});
		const ProcessObject = [];
		eachWorker(cluster, (worker) => {
			ProcessObject.push({
				id: worker.id,
				pid: worker.process.pid
			});
		});
		RenderObject = Object.assign(RenderObject, {
			process: ProcessObject
		});

		Session.find({
			last_seen: {
				$gte: new Date(Date.now())
			}
		}).then((sessions) => {
			eachWorker(cluster, (worker) => {
				worker.ActiveUsers = 0;
			});

			sessions.forEach((session) => {
				let foundProcess = false;

				eachWorker(cluster, (worker) => {
					if (parseInt(session.process, 10) === parseInt(worker.process.pid, 10)) {
						worker.ActiveUsers += 1;
						foundProcess = true;
					}
				});

				if (!foundProcess) {
					Session.deleteOne({
						sessionID: session.sessionID
					});
				}
			});

			RenderObject = Object.assign(RenderObject, {
				title: 'Admin - Process',
				workers: cluster.workers
			});

			res.render('process', RenderObject);
		}).catch((err) => {
			next(err);
		});
	});
});

router.get('/shutdown/:workerId', (req, res) => {
	restartWorker(req.app.cluster, req.params.workerId);
	res.redirect('/process');
});

router.get('/status/:workerId', (req, res) => {
	process.nextTick(() => {
		const cluster = Object.assign(req.app.cluster, {});
		let RenderObject = {};
		const ProcessObject = [];

		eachWorker(cluster, (worker) => {
			ProcessObject.push({
				id: worker.id,
				pid: worker.process.pid
			});
		});

		RenderObject = Object.assign(RenderObject, {
			process: ProcessObject,
			port: req.app.cluster.workers[req.params.workerId].process.pid
		});

		res.render('status', RenderObject);
	});
});

router.use((req, res) => {
	res.redirect('/process');
});

module.exports = router;
