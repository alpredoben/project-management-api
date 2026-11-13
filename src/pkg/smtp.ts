import nodemailer, { Transporter } from "nodemailer";
import ejs from "ejs";
import path from "path";
import { config } from "../config";

export class MailService {
  private transporter?: Transporter;

  async sendVerificationEmail(
    email: string,
    name: string,
    verificationUrl: string,
  ): Promise<void> {
    const html = await ejs.renderFile(
      path.resolve(
        process.cwd(),
        "src",
        "mail",
        "templates",
        "verified-email.ejs",
      ),
      { name, verificationUrl },
    );

    await this.send(email, "Verifikasi alamat email Anda", html);
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    resetUrl: string,
  ): Promise<void> {
    const html = await ejs.renderFile(
      path.resolve(
        process.cwd(),
        "src",
        "mail",
        "templates",
        "reset-password.ejs",
      ),
      { name, resetUrl },
    );

    await this.send(email, "Permintaan reset kata sandi", html);
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    await this.getTransporter().sendMail({
      from: {
        address: config.pkg.smtp.fromAddress,
        name: config.pkg.smtp.fromName,
      },
      to,
      subject,
      html,
      text: html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
    });
  }

  private getTransporter(): Transporter {
    if (!this.transporter) {
      const secure =
        config.pkg.smtp.encryption.toLowerCase() === "ssl" ||
        config.pkg.smtp.port === 465;

      this.transporter = nodemailer.createTransport({
        host: config.pkg.smtp.host,
        port: config.pkg.smtp.port,
        secure,
        requireTLS:
          !secure && config.pkg.smtp.encryption.toLowerCase() === "tls",
        auth: {
          user: config.pkg.smtp.username,
          pass: config.pkg.smtp.password,
        },
      });
    }

    return this.transporter;
  }
}

export const mailService = new MailService();