import logger from '../shared/utils/logger.util';
import { rabbitMQService } from '../pkg/rabbitmq';

// Queue Contract
interface In_QueueSubscriber {
  name: string;
  listen(): Promise<void>;
}

interface In_QueuePublisherTopology {
  name: string;
  setupTopology(): Promise<void>;
}

const QUEUE_PUBLISHERS: In_QueuePublisherTopology[] = [
  // Add your queue publisher topology classes here
];


const QUEUE_SUBSCRIBERS: In_QueueSubscriber[] = [
  // Add your queue subscriber classes here
];

export class QueueListenerManager {
  private static isRunning = false;

  // Open RabbitMQ Connection
  public static async startAll(): Promise<void> {
    if (QUEUE_SUBSCRIBERS.length === 0) {
      logger.info(
        '[Queue Listener Manager] Tidak ada subscriber terdaftar, dilewati.'
      );
      return;
    }

    try {
      await rabbitMQService.connect();
      logger.info('[Queue Listener Manager] Koneksi RabbitMQ berhasil dibuat.');
    } catch (error: any) {
      logger.error(
        `[Queue Listener Manager] Gagal terhubung ke RabbitMQ: ${error.message}`,
        { stack: error.stack }
      );
      return;
    }

    try {
      for (const publisher of QUEUE_PUBLISHERS) {
        await publisher.setupTopology();
      }
      logger.info(
        `[Queue Listener Manager] Topology ${QUEUE_PUBLISHERS.length} publisher berhasil disiapkan: ${QUEUE_PUBLISHERS.map((p) => p.name).join(', ')}`
      );
    } catch (error: any) {
      logger.error(
        `[Queue Listener Manager] Gagal setup topology publisher: ${error.message}`,
        { stack: error.stack }
      );
      return;
    }

    this.isRunning = true;

    QUEUE_SUBSCRIBERS.forEach((subscriber) => {
      Promise.resolve(subscriber.listen()).catch((error: any) => {
        logger.error(
          `[Queue Listener Manager] Subscriber "${subscriber.name}" gagal berjalan: ${error.message}`,
          { stack: error.stack }
        );
      });
    });

    logger.info(
      `[Queue Listener Manager] ${QUEUE_SUBSCRIBERS.length} queue subscriber berhasil diaktifkan di background: ${QUEUE_SUBSCRIBERS.map((s) => s.name).join(', ')}`
    );
  }

  // Close RabbitMQ Connection
  public static async stopAll(): Promise<void> {
    if (!this.isRunning) return;

    try {
      await rabbitMQService?.disconnect();
      logger.info(
        '[Queue Listener Manager] Koneksi RabbitMQ berhasil ditutup.'
      );
    } catch (error: any) {
      logger.error(
        `[Queue Listener Manager] Gagal menutup koneksi RabbitMQ: ${error.message}`,
        { stack: error.stack }
      );
    } finally {
      this.isRunning = false;
    }
  }
}
