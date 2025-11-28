import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
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
