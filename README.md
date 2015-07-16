#Simple Music Visualizer

The goal of this project is to visualize the relationship between motion and music from a given MIDI file using simple animations. We believed that music can not only be heard but can also be felt. This means that our can minds somehow interpret those sound waves into something that we can make sense of.

There are many ways that music can be visualize and this is only one of them.


## Demo
https://youtu.be/_FiIMCw4FoE


## Setup and Usage
For Mac OSX, open RunSMV.app to trigger Terminal to start the application. Your web browser will open with the page loaded and ready to use.

* Note: Press Ctrl+C in Terminal to stop running the web server. *


## How it works
The animation module provides some basic movement parameters such as jump, speed, and gravity. These parameters will be mapped to a time event with a unit of milliseconds in order to display it along with the audio.

The MIDI module takes in a MIDI file and generates a sequence of events for the animation module. The module compute the values for these events from the parameters of a MIDI note such as pitch, velocity, and time. It only responds to 1/8 notes (8 times in 4 beats).


## Known Issues and Limitations
- Only supports a MIDI with time signature 4/4 across the entire piece.

- Only supports certain BPM usually in intervals of 10 (eg. 80 BPM). Always work with 60 BPM and 120 BPM. *This is due to conversion of ticks into millisecond by division, and web browser could not respond to a time unit that fine-grained.*

- Can sometimes be out of sync if the played piece is longer than 30 seconds.

- Synthesizer is limited to only basic sine and square waves.