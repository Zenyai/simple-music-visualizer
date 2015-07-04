import midi, collections

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
    def setBPM(self, events, BPM):
        filteredEvents = [x for x in events if x.name != "Set Tempo"]
        filteredEvents.insert(0, midi.SetTempoEvent(tick=0, bpm=BPM))
        
        return filteredEvents

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

        result = collections.OrderedDict(sorted(result.items()))
        return result

    def convertMidi(self, midifile, newFile, BPM):
        pattern = midi.read_midifile(midifile)
        trackNo = 0
        trackEvents = pattern[trackNo]
        filteredEvents = self.setBPM(trackEvents, BPM)

        pattern[trackNo] = filteredEvents
        midi.write_midifile(newFile, pattern)
        return newFile  # just return the name of new file


    def parseMidi(self, midifile, BPM):
        pattern = midi.read_midifile(midifile)
        trackNo = 0
        trackEvents = pattern[trackNo]
        return self.parseEvents(trackEvents, BPM)
