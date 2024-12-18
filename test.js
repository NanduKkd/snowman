const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const port = new SerialPort({path: '/dev/ttyUSB0', autoOpen: true, baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));// Read the port data
port.on("open", () => {
  console.log('serial port open');
	//ask();
});
parser.on('data', data =>{
	if(data==="next")
		ask();
});

const readline = require('node:readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = () => {
	rl.question(`Enter a val:`, v => {
		const n = Number(v);
		if(!isNaN(n)) {
			port.write([n], (err) => {
    if (err) {
      return console.log('Error on write: ', err.message);
    }
    console.log('message written');
  });
		} else {
			console.log('data', v, n);
		}
	});
}
