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
playersInGame = []


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
    print("Player ID %s" % playerId)
    activePlayers.append(playerId)
    return playerId


class Board:
    def __init__(self):
        self.__hitcount = 17
        self.__board = np.zeros((10, 10),dtype=np.int)

    def setShips(self, posList):
        for pos in posList:
            self.__board[pos[0], pos[1]] = 1
        print(self.__board)

    def checkIfHit(self, position):
        if self.__board[position[0], position[1]] == 1:
            self.__hitcount = self.__hitcount-1
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
        self.addPlayer(playerId)
        gameList[self.__id]=self

    def addPlayer(self, playerId):
        if(len(self.__players) < 2):
            self.__players.append(playerId)
            return 0
        else:
            print("to many players")
            return 1
        

    def setupBoard(self, playerId, posList):
        self.__boards[playerId] = Board()
        self.__boards[playerId].setShips(posList)
        if(len(self.__boards) == 2):
            # print(self.__boards)
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

    def getPlayers(self):
        return self.__players

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
        print('new connection')
        self.__playerId = createPlayerId()
        currentPlayers[self.__playerId] = self
        self.send_message({'type': 'playerId', 'playerId': self.__playerId})

    def on_message(self, message):
        dict_str = message.decode("UTF-8")
        print(dict_str)
        incomingMsg = ast.literal_eval(dict_str)

        print(repr(incomingMsg))
        self.__parseMsgType(incomingMsg)

    def on_close(self):
        # playersInGame.remove(self.__playerId)
        activePlayers.remove(self.__playerId)
        del(currentPlayers[self.__playerId])
        print('Player %d closed  connection' % self.__playerId)

    def check_origin(self, origin):
        return True

    def send_message(self, msg):
        self.write_message(msg, binary=True)

    def getPlayerId(self):
        return self.__playerId

    def __getOponentid(self, gameId: int, playerId: int):
   
        for Id in gameList[gameId].getPlayers():
            if Id != playerId:
                return Id
        return 0

    def __parseMsgType(self, msg: dict):
        if msg['type'] == 'playerId':
            print("Removing player %d" % self.__playerId)
            activePlayers.remove(self.__playerId)
            currentPlayers[int(msg['playerId'])] = currentPlayers.pop(self.__playerId)
            self.__playerId = int(msg['playerId'])
            print("Adding player %d" % self.__playerId)
            
            activePlayers.append(self.__playerId)
            print("Active players %s" % activePlayers)
        elif msg['type'] == 'newGame':
            newGame = GameSession(self.__playerId)
            self.send_message({'type': 'newGame', 'gameId': newGame.getGameId()})
        elif msg['type'] == 'exitGame': 
            oponentId = self.__getOponentid(int(msg['gameId']), self.__playerId)
            if(oponentId != 0):
                currentPlayers[oponentId].send_message({'type': 'exitGame'})
            del (gameList[int(msg['gameId'])])
            print('Players in game %s' % playersInGame)
            print('Active players %s' % activePlayers)
            print('Connections %s' % currentPlayers)
            print('Game list %s' % gameList)
        elif msg['type'] == 'test':
            self.send_message({'type': 'pong'})
        elif msg['type'] == 'joinGame':
            try:
                if(gameList[msg['gameId']].addPlayer(self.__playerId)):
                    self.send_message({'type': 'joinGame', 'result': 1})
                    print("Two many players %d" % self.__playerId )
                else:
                    self.send_message({'type': 'joinGame', 'result': 0})
                    oponentId = self.__getOponentid(msg['gameId'], self.__playerId)
                    currentPlayers[oponentId].send_message(
                        {'type': 'joinGame', 'result': 0})
            except KeyError:
                print("Join Error %d" % self.__playerId)
                self.send_message({'type': 'joinGame', 'result': 1})
        elif msg['type'] == 'shipSetup':
            if(gameList[int(msg['gameId'])].setupBoard(self.__playerId, msg['shipPos'])):
                self.send_message({'type': 'gameReady','yourTurn' : True})
                oponentId = self.__getOponentid(int(msg['gameId']), self.__playerId)
                currentPlayers[oponentId].send_message(
                        {'type': 'gameReady','yourTurn' : False})
                        
        elif msg['type'] == 'sendTorpedo':
            oponentId = self.__getOponentid(int(msg['gameId']), self.__playerId)
            if(oponentId != 0):
                hitResult = gameList[int(msg['gameId'])].checkHit(
                    oponentId, msg['torpedoPos'])
                if(hitResult == 2):
                    currentPlayers[self.__playerId].send_message(
                        {'type': 'gameEnd', 'result': 'won','position': msg['torpedoPos'],'board': 1,'hit':1})
                    currentPlayers[oponentId].send_message(
                        {'type': 'gameEnd', 'result': 'lost','position': msg['torpedoPos'],'board': 0,'hit':1})
                    del (gameList[int(msg['gameId'])])
                else:
                    yourTurn = False
                    if (hitResult == 1):
                        yourTurn = True
                    currentPlayers[int(msg['playerId'])].send_message(
                        {'type': 'torpedo', 'board': 1, 'position': msg['torpedoPos'], 'hit': hitResult, 'yourTurn': yourTurn})
                    currentPlayers[oponentId].send_message(
                        {'type': 'torpedo', 'board': 0, 'position': msg['torpedoPos'], 'hit': hitResult, 'yourTurn': not yourTurn})


class MyApplication(tornado.web.Application):
    is_closing = False

    def signal_handler(self, signum, frame):
        logging.info('exiting...')
        self.is_closing = True

    def try_exit(self):
        if self.is_closing:
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
