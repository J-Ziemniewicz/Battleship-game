import tornado


if __name__ == "__main__":
    application = tornado.web.Application()
    application.listen(8888)
    tornado.ioloop.IOLoop.current().start()