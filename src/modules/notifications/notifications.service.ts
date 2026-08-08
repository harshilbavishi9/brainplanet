import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../database/entities';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
  ) {}

  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notifRepo.find({
      where: { userId },
      order: { sentAt: 'DESC' },
      take: 20,
    });
  }

  async markAsRead(userId: string, notifId: string): Promise<Notification> {
    const notif = await this.notifRepo.findOne({ where: { id: notifId, userId } });
    if (!notif) throw new Error('Notification not found');

    notif.isRead = true;
    notif.readAt = new Date();
    return this.notifRepo.save(notif);
  }

  async sendPlanetAlert(userId: string, message: string): Promise<Notification> {
    const notif = this.notifRepo.create({
      userId,
      message,
      type: 'planet_alert',
      isRead: false,
    });
    return this.notifRepo.save(notif);
  }
}
