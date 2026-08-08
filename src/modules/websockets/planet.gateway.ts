import {
  WebSocketGateway, SubscribeMessage, MessageBody,
  WebSocketServer, ConnectedSocket, OnGatewayInit,
  OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  namespace: '/',
})
export class PlanetGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('PlanetGateway');

  afterInit() {
    this.logger.log('🌍 WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_planet')
  handleJoin(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`planet_${data.userId}`);
    return { event: 'joined', data: `Joined planet room for ${data.userId}` };
  }

  @SubscribeMessage('leave_planet')
  handleLeave(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`planet_${data.userId}`);
  }

  /** Emit planet health update to a specific user's room */
  emitPlanetUpdate(userId: string, health: number, tier: string) {
    this.server.to(`planet_${userId}`).emit('planet_update', { health, tier });
  }

  /** Emit mission completion event */
  emitMissionComplete(userId: string, mission: any) {
    this.server.to(`planet_${userId}`).emit('mission_complete', mission);
  }

  /** Emit reward unlock event */
  emitRewardUnlock(userId: string, reward: any) {
    this.server.to(`planet_${userId}`).emit('reward_unlock', reward);
  }

  /** Emit focus session tick */
  emitSessionTick(userId: string, secondsLeft: number) {
    this.server.to(`planet_${userId}`).emit('session_update', { secondsLeft });
  }
}
