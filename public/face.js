import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";

let canv, ctx, images = {};

const getImages = () => {
	for(let i of ['eyes', 'eyelid1', 'eyelid2', 'eyelid3', 'mouth1', 'mouth2', 'mouth3', 'mouth4']) {
		images[i] = document.getElementById(i);
	}
}


const drawEyeBrows = () => {
	ctx.drawImage(images['eyes'], 0, 0, canv.width, canv.height);
}

let elStatus = 0;
const drawEyeLids = () => {
	elStatus++;
	let frCount = elStatus % 100;
	if(frCount>0 && frCount<4)
		ctx.drawImage(images['eyelid'+frCount], 0, 0, canv.width, canv.height);
}

let mouthStatus = 'closed', mouthFr = 1;
const drawMouth = () => {
	if(mouthStatus==='closed' && mouthFr>1) {
		mouthFr--;
	} else if(mouthStatus==='open' && mouthFr > 2) {
		mouthFr--;
	} else if(mouthStatus==='open' && mouthFr===1) {
		mouthFr = 2;
	} else if(mouthStatus==='talkingin' && mouthFr===6) {
		mouthStatus = 'talkingout';
	} else if(mouthStatus==='talkingout' && mouthFr===2) {
		mouthStatus = 'talkingin';
	} else if(mouthStatus==='talkingin') {
		mouthFr++;
	} else if(mouthStatus==='talkingout') {
		mouthFr--;
	}
	ctx.drawImage(images['mouth'+Math.min(mouthFr, 4)], 0, 0, canv.width, canv.height);
}

let rotationState = 0, rotationDeg = 0;
const rotate = () => {
	if(rotationState===-1) {
		if(rotationDeg<-15) rotationState = 1;
		else rotationDeg-=4;
	} else if(rotationState===1) {
		if(rotationDeg>15) rotationState = -1;
		else rotationDeg+=4;
	} else if(rotationDeg!==0) {
		rotationDeg -= (rotationDeg < 0 ? -4 : 4);
	}
	canv.style.transform = 'rotate('+rotationDeg+'deg)';
}

const draw = () => {
	ctx.clearRect(0, 0, canv.width, canv.height);
	drawEyeBrows();
	drawEyeLids();
	drawMouth();
	rotate();
	setTimeout(draw, 50)
}

document.addEventListener('DOMContentLoaded', () => {
	canv = document.getElementById('canv');
	canv.height = document.body.offsetHeight;
	canv.width = document.body.offsetWidth;
	ctx = canv.getContext('2d');
	getImages();
	draw();
	setTimeout(() => {
		mouthStatus = 'open';
		setTimeout(() => {
			mouthStatus = 'talkingin';
			rotationState = 1;
			setTimeout(() => {
				mouthStatus = 'closed';
				rotationState = 0;
			}, 2000);
		}, 3000);
	}, 3000);
	const socket = io('ws://localhost:3211');
	socket.connect();
	socket.on('test', (arg) => {
		console.log('got msg', arg);
		socket.emit('test1', 'thanks');
	});
});
