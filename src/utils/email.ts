import { transporter } from "../config/mail";

export class EmailService {
  /**
   * Send verification email with 6-digit code
   * In production, this would use a real email service
   * For development, we'll just log to console
   */
  static async sendVerificationEmail(
    email: string,
    code: string,
  ): Promise<void> {
    console.log(`[EMAIL] Sending verification code ${code} to ${email}`);

    console.log({
      MAIL_HOST: process.env.MAIL_HOST,
      MAIL_PORT: process.env.MAIL_PORT,
      MAIL_USER: process.env.MAIL_USER,
      codigo: code,
      email: email
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM,

      to: email,

      subject: "Código de verificación",

      html: `
      <div
        style="
          font-family: Arial, sans-serif;
          padding: 24px;
          max-width: 500px;
          margin: 0 auto;
        "
      >

        <h1
          style="
            color: #111827;
            font-size: 24px;
          "
        >
          Verificación de correo
        </h1>

        <p
          style="
            color: #374151;
            font-size: 16px;
          "
        >
          Usa el siguiente código para verificar tu cuenta:
        </p>

        <div
          style="
            margin: 32px 0;
            padding: 16px;
            background: #f3f4f6;
            border-radius: 8px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #111827;
          "
        >
          ${code}
        </div>

        <p
          style="
            color: #6b7280;
            font-size: 14px;
          "
        >
          Este código expira en 10 minutos.
        </p>

      </div>
    `,
    });
  }

  /**
   * Send welcome email after verification
   */
  static async sendWelcomeEmail(email: string, name: string): Promise<void> {
    console.log(`[EMAIL] Sending welcome email to ${email} for user ${name}`);

    // In a real application, you would use a real email service
    return new Promise((resolve) => setTimeout(resolve, 500));
  }

  /**
   * Send magic link email for login
   */
  static async sendMagicLinkEmail(email: string, magicLink: string, name: string): Promise<void> {
    console.log(`[EMAIL] Sending magic link email to ${email} for user ${name}`);

    console.log({
      MAIL_HOST: process.env.MAIL_HOST,
      MAIL_PORT: process.env.MAIL_PORT,
      MAIL_USER: process.env.MAIL_USER,
      magicLink,
      email
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM,

      to: email,

      subject: "Enlace de acceso a DevPulse",

      html: `
      <div
        style="
          font-family: Arial, sans-serif;
          padding: 24px;
          max-width: 500px;
          margin: 0 auto;
        "
      >

        <h1
          style="
            color: #111827;
            font-size: 24px;
          "
        >
          Acceso a DevPulse
        </h1>

        <p
          style="
            color: #374151;
            font-size: 16px;
          "
        >
          Hola ${name}, haz clic en el siguiente enlace para acceder a tu cuenta:
        </p>

        <div
          style="
            margin: 32px 0;
            padding: 16px;
            background: #f3f4f6;
            border-radius: 8px;
            text-align: center;
          "
        >
          <a
            href="${magicLink}"
            style="
              display: inline-block;
              padding: 12px 24px;
              background-color: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
            "
          >
            Acceder a DevPulse
          </a>
        </div>

        <p
          style="
            color: #6b7280;
            font-size: 14px;
          "
        >
          Este enlace expirará en 15 minutos por motivos de seguridad.
        </p>

        <p
          style="
            color: #6b7280;
            font-size: 14px;
          "
        >
          Si no solicitaste este acceso, puedes ignorar este correo electrónico.
        </p>

      </div>
      `,
    });
  }
}
