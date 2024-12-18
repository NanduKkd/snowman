let sock;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const express = require('express');
const axios = require('axios');
const multer = require('multer');
const app = express();
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })


const chatWithGoogle = async(message, imgBuff, model, instructions) => {
	const googleGenAi = new GoogleGenerativeAI('AIzaSyCync3uZYR4exj7kRO0oP0f36fxQ7pwpIs', {systemInstruction: instructions});
	const llmModel = googleGenAi.getGenerativeModel({ model: model || 'gemini-1.5-flash', systemInstruction: instructions, tools: {functionDeclarations: [
		{
			name: 'CameraInfo',
			parameters: {
				type: 'OBJECT',
				description: "The fields whether there is a person, what the person is doing, etc",
				properties: {
					isPersonThere: {
						type: 'BOOLEAN',
						description: 'Is there a person in the image'
					},
					isPersonShowingFingerSigns: {
						type: 'BOOLEAN',
						description: 'Is the person showing vistory sign with their fingers',
					},
				},
				required: ['isPersonThere', 'isPersonShowingFingerSigns'],
/*
				description: 'The fields whether the there is a snowman, whether a person is near the snowman, and whether the person is posing for a photo with it',
				properties: {
					isSnowmanThere: {
						type: 'BOOLEAN',
						description: 'Is there a snowman in the image'
					},
					isPersonNearSnowman: {
						type: 'BOOLEAN',
						description: 'Is there a person near a snowman in the image'
					},
					isPersonPosing: {
						type: 'BOOLEAN',
						description: 'Is any person showing a victory symbol with their fingers and posing for a photo with the snowman'
					},
				},
				required: ['isSnowmanThere', 'isPersonNearSnowman', 'isPersonPosing'],
				*/
			},
		},
	]}, "toolConfig": {
		"functionCallingConfig": {
			"mode": "ANY",
			"allowedFunctionNames": ["CameraInfo"]
		},
	} });
	const chatRes = await llmModel.generateContent([
		{inlineData: {
			data: imgBuff.toString('base64'),
			mimeType: 'image/png',
		}},
		"What do you see in this image?",
	]);
	return chatRes.response.functionCalls()[0].args;
}

// chatWithGoogle('What is happening in there?', '
// https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Pappmache-Schneemann_Sommertagszug.JPG/1024px-Pappmache-Schneemann_Sommertagszug.JPG'
// , null, 'Make yourself precise').catch(console.error)

app.use(express.static('public'));
app.post('/checkimg', upload.single('image'), async(req, res) => {
	try {
		const r = await chatWithGoogle('What is happening in there?', req.file.buffer, null, 'Make yourself precise')
		res.status(200).json(r);
		console.log(r);
	} catch (error) {
		res.status(500).send(error.message);
		console.error(error);
	}
});
app.use((req, res) => {
	console.log(req.path);
	res.status(404).send('oops');
})

const { createServer } = require('http');
const { Server } = require("socket.io");

const server = createServer();
const io = new Server(server, {
	cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


io.on('connection', (socket) => {
	sock = socket;
	socket.emit('test', 'hi from server');
	socket.on('test1', arg => {
		console.log('got', arg);
	});
});


app.listen(3210, () => {
	console.log('app listening on port 3210');
});

server.listen(3211, () => {
  console.log('server running at http://localhost:3211');
});
