import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web
import tornado.options
import socket
import signal
import logging
import ast
from random import randint
import numpy as np

gameList = {}
currentPlayers = {}
activePlayers = []


def createNewGame():
    while True:
        gameId = randint(100000, 999999)
        if gameId in gameList:
            continue
        break
    print('#%d' % gameId)
    return gameId


def createPlayerId():
    while True:
        playerId = randint(100, 999)

        if playerId in activePlayers:
            continue
        break
    print(playerId)
    activePlayers.append(playerId)
    return playerId


class Board:
    def __init__(self):
        self.__hitcount = 17
        self.__board = np.zeros(10, 10)

    def setShips(self, posList):
        for pos in posList:
            self.__board[pos[0], pos[1]] = 1

    def checkIfHit(self, position):
        if self.__board[position[0], position[1]] == 1:
            return True
        else:
            return False

    def gameFinished(self):
        if self.__hitcount == 0:
            return True
        return False


class GameSession:

    def __init__(self, playerId):
        self.__id = self.__createNewGame()
        self.__players = []
        self.__boards = {}

    def addPlayer(self, playerId):
        if(len(self.__players) < 2):
            self.__players.append(playerId)
        else:
            print("to many players")
        print(self.__players)

    def setupBoard(self, playerId, posList):
        self.__boards[playerId] = Board()
        self.__boards[playerId].setShips(posList)
        if(len(self.__boards) == 2):
            print(self.__boards)
            return True
        return False

    def __createNewGame(self):
        while True:
            gameId = randint(100000, 999999)
            if gameId in gameList:
                continue
            break
        print('#%d' % gameId)
        return gameId

    def getGameId(self):
        return self.__id

    def checkHit(self, playerId, position):
        if(self.__boards[playerId].checkIfHit(position)):
            if(self.__boards[playerId].gameFinished()):
                return 2
            else:
                return 1
        else:
            return 0


class Player(tornado.websocket.WebSocketHandler):

    def open(self):
        self.__playerId = createPlayerId()
        print('new connection')
        currentPlayers[self.__playerId] = self

    def on_message(self, message):
        dict_str = message.decode("UTF-8")
        incomingMsg = ast.literal_eval(dict_str)
        print(repr(incomingMsg))
        self.__parseMsgType(incomingMsg)

    def on_close(self):
        activePlayers.remove(self.__playerId)
        del(currentPlayers[self.__playerId])
        print('connection closed')

    def check_origin(self, origin):
        return True

    def send_message(self, msg):
        self.write_message(msg, binary=True)

    def getPlayerId(self):
        return self.__playerId

    def __getOponentid(self, gameId: int, playerId: int):
        for Id in self.__playerId:
            if Id != playerId:
                return Id
        return 0

    def __parseMsgType(self, msg: dict):
        if msg['type'] == 'newGame':
            newGame = GameSession(self.__playerId)
            self.send_message({'type': 'newGame', 'gameId': newGame.getGameId})
        elif msg['type'] == 'joinGame':
            joinGame = gameList[msg['gameId']]
            joinGame.addPlayer(self.__playerId)
            self.send_message({'type': 'joinGame', 'result': 'success'})
        elif msg['type'] == 'shipSetup':
            if(gameList[msg['gameId']].setupBoard(self.__playerId, msg['shipPos'])):
                for playerId in self.__playerId:
                    currentPlayers[playerId].send_message(
                        {'type': 'gameReady'})
        elif msg['type'] == 'sendTorpedo':
            oponentId = self.__getOponentid(msg['gameId'], msg['playerId'])
            if(oponentId != 0):
                hitResult = gameList[msg['gameId']].checkHit(
                    oponentId, msg['torpedoPos'])
                if(hitResult == 2):
                    currentPlayers[msg['playerId']].send_message(
                        {'type': 'gameEnd', 'result': 'won'})
                    currentPlayers[oponentId].send_message(
                        {'type': 'gameEnd', 'result': 'lost'})
                else:
                    currentPlayers[msg['playerId']].send_message(
                        {'type': 'torpedo', 'board': 1, 'position': msg['torpedoPos'], 'hit': hitResult})
                    currentPlayers[oponentId].send_message(
                        {'type': 'torpedo', 'board': 0, 'position': msg['torpedoPos'], 'hit': hitResult})


class MyApplication(tornado.web.Application):
    is_closing = False

    def signal_handler(self, signum, frame):
        logging.info('exiting...')
        self.is_closing = True

    def try_exit(self):
        if self.is_closing:
            # clean up here
            tornado.ioloop.IOLoop.instance().stop()
            logging.info('exit success')


application = MyApplication([
    (r'/ws', Player),
])


if __name__ == "__main__":
    tornado.options.parse_command_line()
    signal.signal(signal.SIGINT, application.signal_handler)
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(8888)
    myIP = socket.gethostbyname(socket.gethostname())
    print('*** Websocket Server Started at %s***' % myIP)
    tornado.ioloop.PeriodicCallback(application.try_exit, 100).start()
    tornado.ioloop.IOLoop.instance().start()
