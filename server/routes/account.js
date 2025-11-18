import express from "express";
import multer from "multer";
import path from "path";
import * as userController from "../controllers/accountController.js";

const router = express.Router();

// Config multer
const uploadProfilePicturePath = path.join(process.cwd(), "public", "uploads", "profiles");
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadProfilePicturePath),
    filename: (req, file, cb) => {
        cb(null, req.user._id + "-" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// GET
router.get("/register", userController.showRegisterForm);
router.get("/login", userController.showLoginForm);
router.get("/logout", userController.logoutUser);
router.get("/profile", userController.showProfileForm);

// POST
router.post("/register", userController.createAccount);
router.post("/login", userController.loginUser);

// Edit profile avec multer pour image
router.post("/api/accounts/edit", (req, res, next) => {
    req.user = res.locals.user;
    next();
}, upload.single('profile_picture'), userController.editProfile);

// Edit thème
router.use("/api/accounts/edit/theme", express.json(), userController.editTheme);

export default router;