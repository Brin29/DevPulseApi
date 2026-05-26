import { transporter } from "../config/mail.config";

export class EmailService {
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

  static async sendWelcomeEmail(email: string, name: string): Promise<void> {
    console.log(`[EMAIL] Sending welcome email to ${email} for user ${name}`);

    return new Promise((resolve) => setTimeout(resolve, 500));
  }

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

  static async sendTeamInvitationEmail(
    email: string,
    teamName: string,
    invitedByName: string,
    acceptUrl: string,
  ): Promise<void> {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: `Invitación a ${teamName} - DevPulse`,
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
          Te han invitado a un equipo
        </h1>

        <p
          style="
            color: #374151;
            font-size: 16px;
          "
        >
          <strong>${invitedByName}</strong> te ha invitado a unirte al equipo
          <strong>${teamName}</strong> en DevPulse.
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
            href="${acceptUrl}"
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
            Aceptar invitación
          </a>
        </div>

        <p
          style="
            color: #6b7280;
            font-size: 14px;
          "
        >
          Este enlace expirará en 7 días.
        </p>

        <p
          style="
            color: #6b7280;
            font-size: 14px;
          "
        >
          Si no esperabas esta invitación, puedes ignorar este correo.
        </p>
      </div>
      `,
    });
  }
}
