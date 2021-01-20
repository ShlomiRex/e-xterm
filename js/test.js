




var client = require('ssh2').Client()
client.on("ready", function clientOnReady() {
	client.shell(function (err, stream) {
		if (err) throw err;
		console.log(typeof stream)
		stream.on('close', function () {
			console.log('Stream :: close');
			client.end();
		}).on('data', function (data) {
			console.log(""+data);
		});
		
		stream.end('uptime\nexit\n');
	});
}).connect({
	host: "127.0.0.1",
	port: 22,
	username: "test",
	//privatekey: require('fs').readFileSync("C:\\Users\\Shlomi\\.ssh\\id_rsa")
	password: "test"
});


/*
var Client = require('ssh2').Client;

var conn = new Client();
conn.on('ready', function () {
	console.log('Client :: ready');
	conn.exec('uptime', function (err, stream) {
		if (err) throw err;
		stream.on('close', function (code, signal) {
			console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
			conn.end();
		}).on('data', function (data) {
			console.log('STDOUT: ' + data);
		}).stderr.on('data', function (data) {
			console.log('STDERR: ' + data);
		});
	});
}).connect({
	host: 'localhost',
	port: 22,
	username: 'test',
	password: 'test'
});
*/

// example output:
// Client :: ready
// STDOUT:  17:41:15 up 22 days, 18:09,  1 user,  load average: 0.00, 0.01, 0.05
//
// Stream :: exit :: code: 0, signal: undefined
// Stream :: close