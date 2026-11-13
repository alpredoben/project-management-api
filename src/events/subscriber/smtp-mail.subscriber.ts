import { Channel, ConsumeMessage } from "amqplib";
import { rabbitMQService } from "../../pkg/rabbitmq";
import { LIST_QUEUE } from "../../shared/constants";
import logger from "../../shared/utils/logger.util";
import { SmtpMailPublisher } from "../publisher/smtp-mail.publisher";
import { In_DTO_SmtpMailProperties } from "../../interfaces/dto.interface";
import { mailService, MailService } from "../../pkg/smtp";
import {
  createPasswordResetUrl,
  createVerificationUrl,
} from "../../shared/utils/helper";

const { QUEUE, EXCHANGE, ROUTING_KEY, CHANNEL } = LIST_QUEUE.SMTP_MAIL;

export class SmtpMailSubscriber {
  private static channel: Channel | null = null;
  private static LOG_TITLE: string = "SMTP Mail | Subscriber";
  constructor() {}

  public static async listen(): Promise<void> {
    try {
      this.channel = await rabbitMQService.createChannel(CHANNEL);
      await SmtpMailPublisher.setupTopology();
      await this.channel.prefetch(1);

      logger.info(
        `[${this.LOG_TITLE}] Wait message on channel ${CHANNEL}, queue ${QUEUE} (exchange: ${EXCHANGE}, routingKey: ${ROUTING_KEY})...`,
      );

      await this.channel.consume(
        QUEUE,
        async (msg: ConsumeMessage | null) => {
          if (!msg) return;

          try {
            const payload: In_DTO_SmtpMailProperties = JSON.parse(
              msg.content.toString(),
            );
            await SmtpMailSubscriber.executeSMTPMailService(payload);
            SmtpMailSubscriber.safeAck(msg);
          } catch (error: any) {
            logger.error(
              `[${this.LOG_TITLE}] Failed message processing: ${error.message}`,
              { stack: error.stack },
            );
            SmtpMailSubscriber.safeNack(msg);
          }
        },
        { noAck: false },
      );
    } catch (error: Error | any) {
      logger.error(
        `[${this.LOG_TITLE}] Failed to start subscriber: ${error.message}`,
        { stack: error.stack },
      );
      throw error;
    }
  }

  public static async executeSMTPMailService(
    payload: In_DTO_SmtpMailProperties,
  ): Promise<void> {
    const mailer: MailService = mailService;
    switch (payload.type) {
      case "verify-email":
        await mailer.sendVerificationEmail(
          payload.data.email,
          payload.data.name,
          createVerificationUrl(payload.data.verificationToken),
        );
        break;

      case "reset-password":
        await mailer.sendPasswordResetEmail(
          payload.data.email,
          payload.data.name,
          createPasswordResetUrl(payload.data.resetToken),
        );
        break;

      case "invite-workspace":
        break;
      default:
        break;
    }
  }

  private static safeAck(msg: ConsumeMessage): void {
    try {
      this.channel?.ack(msg);
    } catch (ackErr: any) {
      logger.error(
        `[${this.LOG_TITLE}] Failed to ack message (channel likely closed): ${ackErr.message}`,
      );
    }
  }

  private static safeNack(msg: ConsumeMessage): void {
    try {
      this.channel?.nack(msg, false, false);
    } catch (nackErr: any) {
      logger.error(
        `[${this.LOG_TITLE}] Failed to nack message (channel likely closed): ${nackErr.message}`,
      );
    }
  }
}
