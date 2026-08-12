import { Router } from "express";
import authController from '../controllers/auth.controller.js'

const authRouter=Router();


/**POST /api/auth/register */
authRouter.post("/register",authController.register)

/**GET /api/auth/get-me */
authRouter.get("/get-me",authController.getUser)


authRouter.get("/refresh-token",authController.refreshToken)



authRouter.get("/logout",authController.logout)


export default authRouter