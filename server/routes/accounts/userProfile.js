import multer from "multer";
import express from "express";
import { UserModel } from "../../database/users.js"
import path from "path";

export const routeProfile = express.Router();

const uploadProfilePicturePath = path.join(process.cwd(), "public", "uploads", "profiles");
const storage = multer.diskStorage({

    // Destination pour stocker les fichiers
    destination: function (req, file, cb) {
        cb(null, uploadProfilePicturePath);
    },

    // Nom du fichier stocké
    filename: function (req, file, cb) {
        let ext = path.extname(file.originalname);
        cb(null, req.user._id + "-" + Date.now() + ext);
    }
});

let upload = multer({ storage });

export async function routeShowProfile(req, res) {
    if (!res.locals.user)
        res.redirect("/login")

    res.render("accounts/profile", {
        user: res.locals.user
    })
}

/**
 * Route pour éditer le profil utilisateur
 * Méthode: POST
 * URL: /api/accounts/edit
 * Champs du formulaire:
 * - first_name
 * - last_name
 * - bio
 * - profile_picture
 * - theme

 * L'argument d'après est pour passer l'utilisateur de la session à la requête (pour multer et le mettre dans le nom du fichier)
 * Ensuite, on utilise multer pour gérer le fichier uploadé (s'il y en a un) -> Merci https://stackoverflow.com/questions/46079178/how-do-i-post-an-image-with-nodejs-and-multer
 * Enfin, on met à jour les informations de l'utilisateur dans la base de données.
 */
routeProfile.post("/api/accounts/edit", (req, res, next) => {
    req.user = res.locals.user;
    next();
},  upload.single('profile_picture'), async (req, res) => {
        try {
            if (!req.user)
                return res.redirect("/login");

            let user = req.user;        
            let { first_name, last_name, bio, profile_picture, theme } = req.body;

            let updatedData = {
                first_name: first_name,
                last_name: last_name,
                bio: bio,
                profile_picture: profile_picture,
                theme: theme
            };

            if (req.file) {
                updatedData.profile_picture = `/uploads/profiles/${req.file.filename}`;
            }

            await UserModel.findByIdAndUpdate(user._id, updatedData, { new: true });

            res.redirect("/profile");
        } catch (error) {
            console.error("Erreur lors de la mise à jour du profil utilisateur :", error);
            res.status(500).render("error", { error });
        }
    }
);

routeProfile.use("/api/accounts/edit/theme", express.json(), async (req, res) => {
    try {
        if (!res.locals.user)
            return res.status(401).json({ message: "Utilisateur non authentifié" });

        let user = res.locals.user;
        let { theme } = req.body;
        await UserModel.findByIdAndUpdate(user._id, { theme }, { new: true });

        res.json({ message: "Thème mis à jour avec succès" });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du thème utilisateur :", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour du thème" });
    }
});

export const editUserProfile = routeProfile;