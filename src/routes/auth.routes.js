import { Router } from "express";
import authController from '../controllers/auth.controller.js'

const authRouter=Router();


/**POST /api/auth/register */
authRouter.post("/register",authController.register)

authRouter.post("/login",authController.login)


/**GET /api/auth/get-me */
authRouter.get("/get-me",authController.getUser)


authRouter.get("/refresh-token",authController.refreshToken)



authRouter.get("/logout",authController.logout)
authRouter.get("/logout-all",authController.logoutAll)

export default authRouter