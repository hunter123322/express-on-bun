import { Router } from "express";
import { HomeController } from "../../controllers/public/home.init";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get("/", HomeController.init)
router.get("/list/:place", HomeController.initItem)
router.get("/place/:category/:place", HomeController.list)
router.get("/lists/init", HomeController.initItem)
router.get("/:category", HomeController.initItem)


export default router;