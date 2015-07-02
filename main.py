import sys, pygame, os
import midiparser, math

# Configuration
SONG = "chord.mid"
SCREEN_SIZE = width, height = 500, 500
BPM = 120
CAPTION = "Music Visualizer"


# Global Variables
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
FPS = 30

class Util():
    def calculate_speeds(self, object, toX, toY, duration):

        duration /= 100

        x_speed = (toX - object.x) / duration
        y_speed = (toY - object.y) / duration
        return x_speed, y_speed

    # Calculate Y position of the note
    def calculate_note_position(self, pitch):
        return (127 - pitch) * 2

# The circle particle
class Particle:
    def __init__(self, (x, y), size):
        self.x = x
        self.y = y
        self.x_speed = 0
        self.y_speed = 0
        self.size = size
        self.colour = (255, 255, 255)
        self.thickness = 1

    def set_xy_speed(self, toPitch, toX, duration):
        util = Util()
        toY = util.calculate_note_position(toPitch)
        x_speed, y_speed = util.calculate_speeds(self, toX, toY, duration)

        self.x_speed = x_speed
        self.y_speed = y_speed

    def clear_speed(self):
        self.x_speed = 0
        self.y_speed = 0

    def display(self, screen):
        pygame.draw.circle(screen, self.colour, (self.x, self.y), self.size, self.thickness)

    def update(self, ticks):
        x = int(round(float(self.x_speed) * ticks / 1000))
        y = int(round(float(self.y_speed) * ticks / 1000))

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

    def event_loop(self):

        try:
            if pygame.mixer.music.get_pos() >= self.nextGroup:
                self.curNote = self.groupEvents.items()[self.curKey][1][0]
                self.nextGroup = self.groupEvents.keys()[self.curKey + 1]

                self.circleObject.set_xy_speed(self.groupEvents.items()[self.curKey + 1][1][0].pitch, self.curX,
                self.curNote.get_duration())

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

    def display_fps(self):
        caption = "{} - FPS: {:.2f}".format(CAPTION, self.clock.get_fps())
        pygame.display.set_caption(caption)

    def main_loop(self):
        while not self.done:
            pygame.display.flip()
            self.event_loop()
            self.update()
            self.draw()
            pygame.display.update()
            self.ticks = self.clock.tick(self.fps)
            self.display_fps()

if __name__ == "__main__":
    pygame.init()
    runner = Controller()
    # Run the game
    runner.main_loop()
    pygame.quit()
    sys.exit()
