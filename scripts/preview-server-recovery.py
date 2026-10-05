from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
class Handler(SimpleHTTPRequestHandler):
 def end_headers(self):
  self.send_header('Cache-Control','no-store')
  super().end_headers()
 def list_directory(self,path):
  self.send_error(404,'Not found')
  return None
ThreadingHTTPServer(('127.0.0.1',8766),partial(Handler,directory='dist')).serve_forever()
