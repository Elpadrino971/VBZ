import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendAccountConfirmationEmail } from "@/lib/email"
import { checkRateLimit, authRateLimit } from "@/lib/rate-limit"
import bcrypt from "bcryptjs"
import { z } from "zod"

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  role: z.enum(["USER", "ARTIST"]).default("USER"),
})

export async function POST(req: Request) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const rateLimitResult = await checkRateLimit(authRateLimit, `signup:${ip}`)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Trop de tentatives. Veuillez réessayer plus tard." },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { email, password, name, role } = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
      },
    })

    // If role is ARTIST, create artist profile with 90-day trial
    if (role === "ARTIST") {
      const trialEndDate = new Date()
      trialEndDate.setDate(trialEndDate.getDate() + 90)

      await prisma.artist.create({
        data: {
          userId: user.id,
          artistName: name || email.split("@")[0],
          level: "STARTER",
          trialEndDate,
        },
      })
    }

    // Envoyer l'email de confirmation
    try {
      await sendAccountConfirmationEmail(email, name || undefined)
    } catch (emailError) {
      console.error("Email error (non-blocking):", emailError)
      // Ne pas bloquer la création du compte si l'email échoue
    }

    return NextResponse.json(
      { message: "Compte créé avec succès", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}
