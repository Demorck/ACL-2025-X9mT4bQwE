import { UserModel, ajouterAgendaParDefaut } from "../database/users.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

/**
 * Crée un nouvel utilisateur avec mot de passe hashé et ajoute un agenda par défaut
 * @param {{username: string, password: string}} options 
 * @returns 
 */
export async function createUser({ username, password }) {
    let saltRounds = 10;
    let hashedPassword = await bcrypt.hash(password, saltRounds);

    let newUser = new UserModel({
        username,
        password: hashedPassword
    });

    await newUser.save();
    await ajouterAgendaParDefaut(newUser);

    return newUser;
}

/**
 * Vérifie les identifiants et renvoie l'utilisateur si correct
 * @param {{username: string, password: string}} param0 
 * @returns 
 */
export async function authenticateUser({ username, password }) {
    let user = await UserModel.findOne({ username: username });
    if (!user) {
        return null;
    }

    let passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return null;
    }

    return user;
}

/**
 * Crée un token de session et le stocke dans la BDD
 */
export async function createSession(user) {
    let token = crypto.randomBytes(60).toString("base64url");
    user.token = token;

    await user.save();

    return token;
}

/**
 * Supprime le token d'un utilisateur
 */
export async function logoutUser(token) {
    let user = await UserModel.findOne({ token });
    
    if (user) {
        user.token = "";
        await user.save();
    }
}

/**
 * Met à jour les informations du profil
 */
export async function updateProfile(userId, data, file) {
    const updateData = {
        first_name: data.first_name,
        last_name: data.last_name,
        bio: data.bio,
        theme: data.theme
    };

    if(file) {
        updateData.profile_picture = `/uploads/profiles/${file.filename}`;
    }

    return UserModel.findByIdAndUpdate(userId, updateData, { new: true });
}

/**
 * Met à jour uniquement le thème
 */
export async function updateTheme(userId, theme) {
    return UserModel.findByIdAndUpdate(userId, { theme }, { new: true });
}