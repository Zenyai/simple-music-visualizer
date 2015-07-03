import sys, pygame, os
import midiparser, math

# Configuration
SONG = "scale_velo.mid"
SCREEN_SIZE = width, height = 500, 500
BPM = 120
CAPTION = "Music Visualizer"


# Global Variables
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
FPS = 30

class Util():
    def calculateSpeeds(self, object, toX, toY, duration):

        duration /= 100

        speedX = (toX - object.x) / duration
        speedY = (toY - object.y) / duration
        return speedX, speedY

    # Calculate Y position of the note
    def calculateNotePosition(self, pitch):
        return (127 - pitch) * 2

# The circle particle
class Particle:
    def __init__(self, (x, y), size):
        self.x = x
        self.y = y
        self.speedX = 0
        self.speedY = 0
        self.size = self.initialSize = size
        self.colour = (255, 255, 255)
        self.thickness = 1

    def setXYSpeed(self, toPitch, toX, duration):
        util = Util()
        toY = util.calculateNotePosition(toPitch)

        self.speedX, self.speedY = util.calculateSpeeds(self, toX, toY, duration)

    def setSize(self, size):
        self.size = size

    def clearSpeed(self):
        self.speedX = 0
        self.speedY = 0

    def clearSize(self):
        self.size = self.initialSize

    def display(self, screen):
        pygame.draw.circle(screen, self.colour, (self.x, self.y), self.size, self.thickness)

    def update(self, ticks):
        x = int(round(float(self.speedX) * ticks / 1000))
        y = int(round(float(self.speedY) * ticks / 1000))

        self.x += x
        self.y += y

# Control all the game control
class Controller(object):
    def __init__(self):
        self.screen = pygame.display.set_mode(SCREEN_SIZE)
        self.clock = pygame.time.Clock()
        self.fps = FPS
        self.done = False
        self.circleObject = Particle((20, 250), 10)
        self.parsedEvents = midiparser.MidiReader().parseMidi(SONG, BPM)
        self.groupEvents = midiparser.MidiReader().groupEvents(self.parsedEvents)
        self.curNote = None
        self.curX = 20
        self.curKey = 0
        self.x = 10
        self.ticks = 0
        self.nextGroup = 0

        self.screen.fill(BLACK)

        pygame.mixer.music.load(SONG)
        pygame.mixer.music.play(1)

    def eventLoop(self):

        try:
            if pygame.mixer.music.get_pos() >= self.nextGroup:
                self.curNote = self.groupEvents.items()[self.curKey][1][0]
                self.nextGroup = self.groupEvents.keys()[self.curKey + 1]

                toPitch = self.groupEvents.items()[self.curKey + 1][1][0].pitch

                # Alter particle
                self.circleObject.setXYSpeed(toPitch, self.curX, self.curNote.get_duration())
                self.circleObject.setSize(self.curNote.velocity / 4)

                self.curKey += 1
                self.curX += 20
        except IndexError:
            if pygame.mixer.music.get_pos() >= self.curNote.end:
                self.done = True

    def update(self):
        self.circleObject.update(self.ticks)

    def draw(self):
        self.screen.fill(BLACK)
        self.circleObject.display(self.screen)

    def displayFPS(self):
        caption = "{} - FPS: {:.2f}".format(CAPTION, self.clock.get_fps())
        pygame.display.set_caption(caption)

    def mainLoop(self):
        while not self.done:
            pygame.display.flip()
            self.eventLoop()
            self.update()
            self.draw()
            pygame.display.update()
            self.ticks = self.clock.tick(self.fps)
            self.displayFPS()

if __name__ == "__main__":
    pygame.init()
    runner = Controller()
    # Run the game
    runner.mainLoop()
    pygame.quit()
    sys.exit()
