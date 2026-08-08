import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany, BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column()
  displayName: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ default: 1 })
  brainLevel: number;

  @Column({ default: 0 })
  xp: number;

  @Column({ default: 100 })
  coins: number;

  @Column({ default: 0 })
  streak: number;

  @Column({ type: 'timestamp', nullable: true })
  lastActiveAt: Date;

  @Column({ default: 'email' })
  authProvider: string; // 'email' | 'google' | 'apple'

  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  fcmToken: string;

  @Column({ default: true })
  notificationsEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async comparePassword(plain: string): Promise<boolean> {
    return bcrypt.compare(plain, this.password);
  }
}

// ─────────────────────────────────────────────────────────────────

@Entity('planets')
export class Planet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 75.0 })
  health: number;

  @Column({ type: 'int', default: 7 })
  mood: number;

  @Column({ type: 'jsonb', default: [] })
  unlockedObjects: string[];

  @Column({ type: 'int', default: 0 })
  totalReelsSaved: number;

  @Column({ type: 'varchar', default: 'earth' })
  activePlanet: string;

  @UpdateDateColumn()
  lastUpdatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────

@Entity('focus_sessions')
export class FocusSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column()
  durationMin: number;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ default: false })
  isCancelled: boolean;

  @Column({ nullable: true })
  xpEarned: number;

  @Column({ nullable: true })
  coinsEarned: number;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;
}

// ─────────────────────────────────────────────────────────────────

@Entity('social_usage')
export class SocialUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column()
  appName: string; // 'instagram' | 'facebook' | 'youtube' | 'snapchat'

  @Column()
  usedMinutes: number;

  @Column({ type: 'date' })
  date: string; // YYYY-MM-DD

  @CreateDateColumn()
  createdAt: Date;
}

// ─────────────────────────────────────────────────────────────────

@Entity('app_limits')
export class AppLimit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column()
  appName: string;

  @Column({ default: 30 })
  dailyLimitMin: number;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────

@Entity('daily_missions')
export class DailyMission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column()
  type: string;

  @Column()
  title: string;

  @Column({ default: 0 })
  targetValue: number;

  @Column({ default: 0 })
  currentValue: number;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ default: 25 })
  coinReward: number;

  @Column({ default: 50 })
  xpReward: number;

  @Column({ type: 'date' })
  date: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;
}

// ─────────────────────────────────────────────────────────────────

@Entity('xp_history')
export class XPHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column()
  amount: number;

  @Column()
  source: string; // 'focus_session' | 'mission' | 'streak' | 'daily'

  @CreateDateColumn()
  createdAt: Date;
}

// ─────────────────────────────────────────────────────────────────

@Entity('mood_history')
export class MoodHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'int' })
  mood: number; // 1-10

  @Column({ nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: Date;
}

// ─────────────────────────────────────────────────────────────────

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column()
  message: string;

  @Column()
  type: string; // 'planet_alert' | 'mission_reminder' | 'reward_unlock' | 'streak'

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @CreateDateColumn()
  sentAt: Date;
}
