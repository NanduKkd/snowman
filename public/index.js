let disp;

const toImg = (canv) => {
	return new Promise((res) => {
		canv.toBlob(res, "image/png");
	});
}

const sendImage = async(canv) => {
	try {
		disp.innerText = "Loading...";
		const img = await toImg(canv);
		const fd = new FormData();
		fd.append('image', img, 'img.png');
		const res = await fetch('/checkimg', {method: 'POST', body: fd})
		if(res.status>=400)
			throw new Error('Something went wrong');
		const body = await res.json();
		disp.innerText = "Person: "+body.isPersonThere+", Posing: "+body.isPersonShowingFingerSigns;
	} catch (error) {
		console.error(error);
	}
}

let video;
document.addEventListener('DOMContentLoaded', () => {
	video = document.createElement('video');
	video.setAttribute('playsinline', '');
	video.setAttribute('autoplay', '');
	video.setAttribute('muted', '');
	video.style.width = '600px';
	video.style.height = '600px';
	disp = document.getElementById('disp');

	/* Setting up the constraint */
	var facingMode = "user"; // Can be 'user' or 'environment' to access back or front camera (NEAT!)
	var constraints = {
	  audio: false,
	  video: {
	   facingMode: facingMode
	  }
	};

	/* Stream it to video element */
	navigator.mediaDevices.getUserMedia(constraints).then(function success(stream) {
	  video.srcObject = stream;
	});
	document.body.append(video);
	processor.doLoad();
});


let processor = {
    timerCallback: function() {
      if (this.video.paused || this.video.ended) {
        return;
      }
      this.computeFrame();
		setTimeout(() => {
          this.timerCallback();
        }, 4000);
    },
  
    doLoad: function() {
    	this.video = video;
    	this.c1 = document.getElementById("c1");
		this.ctx1 = this.c1.getContext("2d");
		this.video.addEventListener("play", () => {
        	this.width = this.video.videoWidth / 2;
        	this.height = this.video.videoHeight / 2;
        	this.timerCallback();
        }, false);
    },
  
    computeFrame: function() {
		console.log('sjdhsjdh');
      this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);
		sendImage(this.c1)
    }
  };


