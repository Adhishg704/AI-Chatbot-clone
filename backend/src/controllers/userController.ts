import User from "../models/User.js";
import { Request, Response, NextFunction } from "express";
import { hash, compare } from "bcrypt";
import { createToken } from "../utils/token-manager.js";
import { COOKIE_NAME } from "../utils/constants.js";

export const getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const users = await User.find();
        res.status(200).json({message: "OK", users: users});
    } catch (error) {
        console.log(error);
        res.status(400).json({message: "ERROR", cause: error.message});
    }
};

export const userSignup = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {name, email, password} = req.body;
        const hashedPassword = await hash(password, 10);
        const existingUser = await User.findOne({email: email});
        if(existingUser) {
            return res.status(401).send("User already registered");
        }
        const user = new User({name: name, email: email, password: hashedPassword});
        await user.save();

        //create token and store cookie
        res.clearCookie(COOKIE_NAME, {
            path: "/",
            domain: "localhost",
            httpOnly: true,
            signed: true
        });

        const token = createToken(user._id.toString(), user.email, "7d");
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        
        res.cookie(COOKIE_NAME, token, {
            path: "/",
            domain: "localhost",
            expires,
            httpOnly: true,
            signed: true
        });

        return res.status(201).json({message: "OK", user: user._id.toString()});
    } catch (error) {
        console.log(error);
        return res.status(400).json({message: "ERROR", cause: error.message});
    }
};

export const userLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password} = req.body;
        const user = await User.findOne({email: email});
        if(!user) {
            return res.status(401).send("User is not registered");
        }
        const isPasswordCorrect = compare(password, user.password);
        if(!isPasswordCorrect) {
            return res.status(403).send("Incorrect password");
        }

        res.clearCookie(COOKIE_NAME, {
            path: "/",
            domain: "localhost",
            httpOnly: true,
            signed: true
        });

        const token = createToken(user._id.toString(), user.email, "7d");
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        res.cookie(COOKIE_NAME, token, {
            path: "/",
            domain: "localhost",
            expires,
            httpOnly: true,
            signed: true
        });
        return res.status(201).json({message: "OK", user: user._id.toString()});
    } catch (error) {
        console.log(error);
        return res.status(400).json({message: "ERROR", cause: error.message});
    }
};