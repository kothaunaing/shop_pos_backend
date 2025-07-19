import { Global, Module } from '@nestjs/common';
import { SocketGateway } from 'src/socket/socket.gateway';

@Global()
@Module({
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
