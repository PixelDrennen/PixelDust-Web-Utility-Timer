import { useState, useEffect, useRef } from 'react';
import alarmsound from './../audio/alarm.mp3';
import './TimerPage.css';

export default function TimerPage() {
	const [minutes, setMinutes] = useState(3);
	const [seconds, setSeconds] = useState(0);
	const [timeLeft, setTimeLeft] = useState(0);
	const [isRunning, setIsRunning] = useState(false);
	const startTime = useRef(null); // Store the start time
	const colorRef = useRef("#FFFF00"); // Default color set to yellow
	const alertTriggered = useRef(false); // Track if the alert has been triggered
	const [timerStateFeedback, setTimerStateFeedback] = useState(<span>Set a time and click <span style={{ color: "#5FA8D3" }}>Start</span>.</span>)
	const timerComplete = useRef(false);

	// Helper function for lerping between colors
	const lerpColor = (color1, color2, t) => {
		const r1 = parseInt(color1.slice(1, 3), 16);
		const g1 = parseInt(color1.slice(3, 5), 16);
		const b1 = parseInt(color1.slice(5, 7), 16);

		const r2 = parseInt(color2.slice(1, 3), 16);
		const g2 = parseInt(color2.slice(3, 5), 16);
		const b2 = parseInt(color2.slice(5, 7), 16);

		const r = Math.round(r1 + t * (r2 - r1));
		const g = Math.round(g1 + t * (g2 - g1));
		const b = Math.round(b1 + t * (b2 - b1));

		return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
	};

	useEffect(() => {
		// console.log("useEffect triggered");

		// document.querySelector(".pFinishTime").innerHTML = timerStateFeedback.current;

		if (!isRunning || timeLeft <= 0) return; // Do nothing if the timer isn't running or time is up

		if (!startTime.current) {
			startTime.current = Date.now(); // Initialize the start time
		}

		const interval = setInterval(() => {
			// document.querySelector(".pFinishTime").innerHTML = timerStateFeedback;

			const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
			const thirtyPercentTime = totalSeconds * 0.2;

			const currentTime = Date.now();
			const elapsed = ((currentTime - startTime.current) / 1000); // Calculate elapsed time in seconds


			const remainingTime = totalSeconds - elapsed; // Calculate the remaining time
			setTimeLeft(remainingTime);

			// If time is up, show an alert
			if (remainingTime <= 0 && !alertTriggered.current) {
				alertTriggered.current = true;
				setIsRunning(false);
				// alert("Time's up!");
				setTimerStateFeedback(<span>Time's up!<br />Set a time and click <span style={{ color: "#5FA8D3" }}>Start</span>.</span>);

				// resetColor();
				timerComplete.current = true;
				flashGreen();

				return;
			}

			// Interpolate color when the remaining time is less than 30%
			if (remainingTime <= thirtyPercentTime) {
				// console.log("Lerping color", remainingTime, thirtyPercentTime)
				const elapsedSinceThirtyPercent = thirtyPercentTime - remainingTime;
				const interpolationPercentage = Math.min(elapsedSinceThirtyPercent / thirtyPercentTime, 1);


				const yellow = "#FFFF00";
				const colorFinish = "#6B8E23";

				// Smooth color interpolation
				const newColor = lerpColor("#242424", colorFinish, interpolationPercentage);
				// console.log(interpolationPercentage);
				document.getElementById("root").style.backgroundColor = newColor;
				colorRef.current = newColor;
			}
		}, 20); // Update every 200ms

		// Cleanup the interval when the component unmounts or dependencies change



		return () => {
			clearInterval(interval);
			// clearInterval(fadeoutInterval);
		}
	}, [isRunning, timeLeft, minutes, seconds]);


	// Function to flash the background to green and back
	const flashGreen = () => {
		let t = 0;
		const audio = new Audio(alarmsound);
		const audioInterval = setInterval(() => {
			audio.play();
		}, 500);
		const flashInterval = setInterval(() => {
			t += 20;
			const flashColor = "#6B8E23"; // Green color
			const currentColor = colorRef.current;

			// Smooth color interpolation
			const newColor = lerpColor("#242424", flashColor, Math.sin(t / 200) * 0.5 + 0.5);
			document.getElementById("root").style.backgroundColor = newColor;
			colorRef.current = newColor;

			// Stop the flashing effect after 2 seconds
			if (timerComplete.current == false) {
				console.log("effect ended");
				resetColor();
				clearInterval(flashInterval);
				clearInterval(audioInterval);
				return;
			}
		}, 20);
		
		
	};

	const resetColor = () => {
		timerComplete.current = false;
		let t = 0;
		const fadeoutInterval = setInterval(() => {
			t += 20;
			const yellow = "#FFFF00";
			const colorFinish = "#6B8E23";

			// Smooth color interpolation
			const newColor = lerpColor(colorRef.current, "#242424", t / 2000);
			document.getElementById("root").style.backgroundColor = newColor;
			colorRef.current = newColor;

			// console.log(t / 2000);
			if (t >= 2000) {
				// console.log("end", t)
				clearInterval(fadeoutInterval);
				return;
			}
		}, 20);
	}

	const startTimer = () => {
		if (timerComplete.current) {
			resetTimer();
			return;
		}
		// setIsRunning(true);
		const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
		console.log("Total seconds", totalSeconds)
		// startTimeRef = Date.now(); // Set the start time when the timer starts
		setTimeout(() => {
			if (totalSeconds > 0) {
				startTime.current = Date.now();
				setTimeLeft(totalSeconds);
				setIsRunning(true);
				alertTriggered.current = false; // Reset the alert trigger
				console.log("Starting timer")
				getEndTime();

			}
		}, 500);
	};


	const getEndTime = () => {
		const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
		const finishDate = new Date(Date.now() + totalSeconds * 1000);
		const timeString = finishDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
		const secondsString = String(finishDate.getSeconds()).padStart(2, '0');

		setTimerStateFeedback(
			<span>Timer will finish at&nbsp;
				{timeString}
				<sub style={{ color: '#5FA8D3', fontSize: 'smaller' }}> +{secondsString}s</sub>
			</span>
		);

	}

	const resetTimer = () => {
		setIsRunning(false);
		setMinutes(3);
		setSeconds(0);
		setTimeLeft(0);
		resetColor();
		startTime.current = 0;
		alertTriggered.current = false; // Reset the alert trigger
	};

	const handleInputChange = (e, type) => {
		const value = e.target.value;
		if (value === '' || /^[0-9]*$/.test(value)) {
			if (type === "minutes") {
				setMinutes(value === '' ? '' : parseInt(value, 10));
			} else if (type === "seconds") {
				setSeconds(value === '' ? '' : parseInt(value, 10));
			}
		}
	};

	const handleBlur = (type) => {
		if (type === "minutes" && minutes !== '') {
			setMinutes(parseInt(String(minutes).padStart(2, '0')));
		} else if (type === "seconds" && seconds !== '') {
			setSeconds(parseInt(String(seconds).padStart(2, '0')));
		}
	};

	// Round the timeLeft to avoid decimals
	const displayMinutes = Math.floor(timeLeft / 60);
	const displaySeconds = Math.floor(timeLeft % 60);

	return (
		<div className="timer-container">
			<h1 className="timer-header">Timer</h1>

			<div className="time-controls">
				<div className="control-group">
					<button onClick={() => setMinutes((prev) => Math.min(prev + 1, 59))} className="control-button">▲</button>
					<input
						type="text"
						value={isRunning ? String(displayMinutes).padStart(2, '0') : String(minutes).padStart(2, '0')}
						onChange={(e) => handleInputChange(e, "minutes")}
						onBlur={() => handleBlur("minutes")}
						className="time-input"
					/>
					<button onClick={() => setMinutes((prev) => Math.max(prev - 1, 0))} className="control-button">▼</button>
				</div>

				<h4>:</h4>

				<div className="control-group">
					<button onClick={() => setSeconds((prev) => prev === 59 ? 0 : prev + 1)} className="control-button">▲</button>
					<input
						type="text"
						value={isRunning ? String(displaySeconds).padStart(2, '0') : String(seconds).padStart(2, '0')}
						onChange={(e) => handleInputChange(e, "seconds")}
						onBlur={() => handleBlur("seconds")}
						className="time-input"
					/>
					<button onClick={() => setSeconds((prev) => prev === 0 ? 59 : prev - 1)} className="control-button">▼</button>
				</div>
			</div>
			<p className="pFinishTime">{timerStateFeedback}</p>

			<div className="action-buttons">
				{!isRunning ? (
					<button onClick={startTimer} className="btn-start">{timerComplete.current ? 'OK' : 'Start'}</button>
				) : (
					<button onClick={resetTimer} className="btn-reset">Reset</button>
				)}
			</div>
		</div>
	);
}
