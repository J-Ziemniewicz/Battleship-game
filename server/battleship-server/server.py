import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web
import tornado.options
import socket
import signal
import logging
import pickle
import base64
import codecs
import ast


'''
This is a simple Websocket Echo server that uses the Tornado websocket handler.
Please run `pip install tornado` with python of version 2.7.9 or greater to install tornado.
This program will echo back the reverse of whatever it recieves.
Messages are output to the terminal for debuggin purposes.
'''


class WSHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        print('new connection')

    def on_message(self, message):
        print('message received:  %s' % message)
        dict_str = message.decode("UTF-8")
        mydata = ast.literal_eval(dict_str)
        print(repr(mydata))
        print(mydata["type"])

        # Reverse Message and send it back
        # print('sending back message: %s' % message[::-1])

        # self.write_message(message[::-1])
        new_message = {'type': 'test'}
        print(type(new_message))
        print(new_message)
        # b64_message = pickle.dumps(new_message).encode('base64', 'strict')
        # print(b64_message)
        # b64_message = base64.b64encode(message.encode('UTF-8'))
        # b64_message = codecs.encode(pickle.dumps(new_message), "base64")
        self.write_message(new_message, binary=True)

    def on_close(self):
        print('connection closed')

    def check_origin(self, origin):
        return True


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
    (r'/ws', WSHandler),
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
