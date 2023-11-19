import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer() server: Server;
  @SubscribeMessage('run')
  run(): Observable<WsResponse<string>> {
    const { spawn } = require('child_process');
    const process = spawn('python', ['./test/app.py']);

    process.on('exit', () => {
      this.server.emit('done', 'Process finished');
    });

    return from(process.stdout).pipe(
      map((data) => {
        return { event: 'data', data: data.toString() };
      }),
    );
  }
}
