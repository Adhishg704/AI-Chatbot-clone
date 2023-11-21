import { Router } from "express";
import { getAllUsers, userLogin, userSignup } from "../controllers/userController.js";
import { loginValidator, signUpValidator, validate } from "../utils/validators.js";
const userRouter = Router();
userRouter.get("/", getAllUsers);
userRouter.post("/signup", validate(signUpValidator), userSignup);
userRouter.post("/login", validate(loginValidator), userLogin);
export default userRouter;
//# sourceMappingURL=user-routes.js.map