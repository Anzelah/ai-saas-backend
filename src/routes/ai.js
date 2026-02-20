const express = require("express")
const { PrismaClient } = require("../generated")
const authMiddleware = require("../middleware/auth")

const prisma = new PrismaClient()
const router = express.Router()