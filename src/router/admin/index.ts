import { Router } from "express";
import { HomeController } from "../../controllers/public/home.init";
import multer from "multer";
import { AdminController } from "../../controllers/admin/admin";
import { jwtMiddleware } from "../../middlewares/jwt";

const upload = multer({ storage: multer.memoryStorage() });
const adminRouter = Router();

adminRouter.get("/category/:category", jwtMiddleware, AdminController.getCategoryItems)
adminRouter.get("/spots/:slug", jwtMiddleware, AdminController.getBySlug)
adminRouter.post("/place", jwtMiddleware, upload.single("file"), AdminController.create)
adminRouter.put("/spots/:slug", jwtMiddleware, upload.single("file"), AdminController.update)
adminRouter.delete("/spots/:slug", jwtMiddleware, AdminController.delete)

adminRouter.get("/place/:resource/:slug", jwtMiddleware, AdminController.getBySlug)
adminRouter.get("/init", jwtMiddleware, AdminController.init)

adminRouter.post("/login", AdminController.login)

adminRouter.get("/me", jwtMiddleware, AdminController.me)


export default adminRouter;