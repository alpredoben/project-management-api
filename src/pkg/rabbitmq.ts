import amqp, { Channel, ChannelModel } from 'amqplib';
import { config } from '../config';

export class RabbitMQService {
  private connection: ChannelModel | null = null;

  public async connect(): Promise<void> {
    try {
      const { username, password, host, port } = config.pkg.rabbitmq;
      const amqpUrl = `amqp://${username}:${password}@${host}:${port}`;

      this.connection = await amqp.connect(amqpUrl);

      console.log('[RabbitMQ] Connected successfully');

      this.connection.on('error', (err) => {
        console.error('[RabbitMQ] Connection error', err);
      });

      this.connection.on('close', () => {
        console.warn('[RabbitMQ] Connection closed');
      });
    } catch (error) {
      console.error('[RabbitMQ] Connection failed:', error);
      process.exit(1);
    }
  }

  public async createChannel(label: string): Promise<Channel> {
    if (!this.connection) {
      throw new Error(
        '[RabbitMQ] Connection is not initialized. Ensure connect() is called first.'
      );
    }

    const channel = await this.connection.createChannel();

    channel.on('error', (err) => {
      console.error(`[RabbitMQ] Channel error (${label}):`, err.message);
    });

    channel.on('close', () => {
      console.warn(`[RabbitMQ] Channel closed (${label})`);
    });

    return channel;
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.close();
      }
      console.log('[RabbitMQ] Disconnected successfully');
    } catch (error) {
      console.error('[RabbitMQ] Error during disconnection:', error);
    }
  }
}

export const rabbitMQService = new RabbitMQService();
