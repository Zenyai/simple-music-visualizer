import midi

class NoteInfo:
    def __init__(self, pitch, velocity, start=None, end=None, duration=None):
        self.pitch = pitch
        self.velocity = velocity
        self.start = start
        self.end = end

    def get_duration(self):
        return self.end - self.start

    def __str__(self):
        return "<Pitch: %s, Velocity: %s, Start: %s, End: %s>" % (self.pitch, self.velocity, self.start, self.end)

    def __repr__(self):
        return str(self)

class MidiReader:
    def filterNoteEvents(self, events):
        return [e for e in events if e.name == "Note On" or e.name == "Note Off"]

    def tickToMilliseconds(self, tick, BPM, resolution=96):
        return tick * 60000 / float(resolution * BPM)

    def parseEvents(self, events, BPM):
        result = []
        noteEvents = self.filterNoteEvents(events)

        noteDict = {}
        timePassed = 0.0

        for event in noteEvents:
            tick = event.tick
            milliseconds = self.tickToMilliseconds(tick, BPM)

            timePassed += milliseconds

            if event.name == "Note On":
                result.append(NoteInfo(event.pitch, event.velocity, start=timePassed))
            elif event.name == "Note Off":
                for i, item in reversed(list(enumerate(result))):
                    if item.pitch == event.pitch:
                        result[i].end = timePassed
                        break

        return result

    def groupEvents(self, parsed):
        result = {}

        for event in parsed:
            key = event.start

            if key not in result: result[key] = []
            result[key].append(event)

        return result

    def parseMidi(self, SONG, BPM):
        pattern = midi.read_midifile(SONG)
        trackNo = 0
        trackEvents = pattern[trackNo]
        return self.parseEvents(trackEvents, BPM)
