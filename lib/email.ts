import { Resend } from "resend"

if (!process.env.RESEND_API_KEY) {
  console.warn("⚠️ RESEND_API_KEY not configured - emails will not be sent")
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function sendEmail({
  to,
  subject,
  html,
  from = "VYbzzZ <noreply@vybzzz.com>",
}: {
  to: string
  subject: string
  html: string
  from?: string
}) {
  if (!resend) {
    console.log("📧 Email would be sent:", { to, subject })
    return { success: false, error: "Email service not configured" }
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    })

    if (error) {
      console.error("❌ Email error:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("❌ Email exception:", error)
    return { success: false, error }
  }
}

export async function sendAccountConfirmationEmail(email: string, name?: string) {
  return sendEmail({
    to: email,
    subject: "Bienvenue sur VYbzzZ !",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FFC42E;">Bienvenue sur VYbzzZ !</h1>
        <p>Bonjour ${name || "utilisateur"},</p>
        <p>Votre compte a été créé avec succès. Vous pouvez maintenant découvrir et acheter des tickets pour vos concerts préférés.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}" style="display: inline-block; background-color: #FFC42E; color: black; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">Accéder à VYbzzZ</a>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">© VYbzzZ 2025 - Tous droits réservés</p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/auth/reset-password?token=${resetToken}`
  
  return sendEmail({
    to: email,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FFC42E;">Réinitialisation de mot de passe</h1>
        <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #FFC42E; color: black; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">Réinitialiser mon mot de passe</a>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">Ce lien expire dans 1 heure.</p>
        <p style="color: #666; font-size: 12px;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">© VYbzzZ 2025 - Tous droits réservés</p>
      </div>
    `,
  })
}

export async function sendTicketConfirmationEmail(
  email: string,
  ticket: {
    id: string
    concertTitle: string
    qrCode: string
    pricePaid: number
    purchaseDate: Date
  }
) {
  return sendEmail({
    to: email,
    subject: `Votre ticket pour ${ticket.concertTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FFC42E;">Votre ticket est prêt !</h1>
        <p>Merci pour votre achat !</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">${ticket.concertTitle}</h2>
          <p><strong>Prix payé :</strong> ${ticket.pricePaid.toFixed(2)} €</p>
          <p><strong>Date d'achat :</strong> ${new Date(ticket.purchaseDate).toLocaleDateString("fr-FR")}</p>
          <p><strong>Code QR :</strong> ${ticket.qrCode}</p>
        </div>
        <img src="${ticket.qrCode}" alt="QR Code" style="max-width: 200px; margin: 20px 0;" />
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/account/tickets" style="display: inline-block; background-color: #FFC42E; color: black; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">Voir mes tickets</a>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">© VYbzzZ 2025 - Tous droits réservés</p>
      </div>
    `,
  })
}

export async function sendConcertEndedEmail(
  email: string,
  concert: {
    title: string
    artistName: string
  }
) {
  return sendEmail({
    to: email,
    subject: `Merci d'avoir assisté à ${concert.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FFC42E;">Merci !</h1>
        <p>Merci d'avoir assisté au concert <strong>${concert.title}</strong> de <strong>${concert.artistName}</strong>.</p>
        <p>Nous espérons que vous avez passé un excellent moment !</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/concerts" style="display: inline-block; background-color: #FFC42E; color: black; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">Découvrir d'autres concerts</a>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">© VYbzzZ 2025 - Tous droits réservés</p>
      </div>
    `,
  })
}

