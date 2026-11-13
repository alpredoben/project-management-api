import { Channel } from 'amqplib';
import { rabbitMQService } from '../../pkg/rabbitmq';
import { LIST_QUEUE } from '../../shared/constants';
import logger from '../../shared/utils/logger.util';
import { In_DTO_SmtpMailProperties } from '../../interfaces/dto.interface';

const { QUEUE, EXCHANGE, ROUTING_KEY, CHANNEL } = LIST_QUEUE.SMTP_MAIL;


export class SmtpMailPublisher {
  private static channel: Channel | null = null;
  private static topologyReady = false;
  private static LOG_TITLE: string = 'SMTP Mail | Publisher';

  private static async getChannel(): Promise<Channel> {
    if (!this.channel) {
      this.channel = await rabbitMQService.createChannel(CHANNEL);
    }
    return this.channel;
  }

  public static async setupTopology(): Promise<void> {
    const channel = await this.getChannel();
    await channel.assertExchange(EXCHANGE, 'direct', { durable: true });
    await channel.assertQueue(QUEUE, { durable: true });
    await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);

    this.topologyReady = true;

    logger.info(
      `${this.LOG_TITLE}] Ready Topology -> on channel: ${CHANNEL} exchange: ${EXCHANGE}, queue: ${QUEUE}, routingKey: ${ROUTING_KEY}`
    );
  }

  public static async publish(payload: In_DTO_SmtpMailProperties): Promise<void> {
    try {
      const channel = await this.getChannel();

      if (!this.topologyReady) {
        await this.setupTopology();
      }

      const message = Buffer.from(JSON.stringify(payload));
      const isSent = channel.publish(EXCHANGE, ROUTING_KEY, message, {
        persistent: true,
        contentType: 'application/json',
      });

      if (!isSent) {
        logger.warn(
          `[${this.LOG_TITLE}] Failed send message to exchange ${EXCHANGE} (buffer overload).`
        );
        return;
      }

      logger.info(
        `[${this.LOG_TITLE}] Success send notification message to exchange ${EXCHANGE} with routing key ${ROUTING_KEY}.`
      );
    } catch (error: any) {
      logger.error(
        `[${this.LOG_TITLE}] Failed send notification payload: ${error.message}`,
        { stack: error.stack }
      );
    }
  }
}