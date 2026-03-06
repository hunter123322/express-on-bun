import type { Request, Response } from 'express';
import { CardsModel } from '../../models/cards.model';
import { blob } from '../../utils/minio';
import type { CardsType, HotelType, RestaurantType, UserType } from '../../types/types';
import { TouristSpot } from '../../models/spots.model';
import sharp from 'sharp';
import type { TouristSpotType } from '../../types/types';
import { Restaurants } from '../../models/restaurants.model';
import { Hotels } from '../../models/hotels.model';
import { TouristGuide } from '../../models/tourguides.model';
import { Terminals } from '../../models/terminals.model';
import { generateToken, verifyToken } from '../../middlewares/jwt';
import { User } from '../../models/user.model';


type CategoryParam = "spots" | "restaurants" | "hotels" | "guides" | "terminals"

export class AdminController {
    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "Try Again" });
            }

            const user = await User.findOne<UserType>({ email });

            if (!user) {
                return res.status(400).json({ message: "Invalid credentials" });
            }

            const isMatch = await Bun.password.verify(
                password,
                user.passwordHash
            );

            if (!isMatch) {
                return res.status(400).json({ message: "Invalid credentials" });
            }

            const token = generateToken({
                username: user.username,
                role: user.role
            });
            console.log(token, "sucess")

            res.cookie("auth_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 1000 * 60 * 60 * 24 * 7
            })
            res.status(200).json({ message: "Login successful" })
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Server error" });
        }
    }

    static async me(req: Request, res: Response) {
        console.log("called me");
        
        const token = req.cookies['auth_token']
        if (!token) return res.status(401).json({ message: 'Unauthorized' })

        const user = verifyToken(token) as { username: string, role: "ADMIN" | "DEVELOPER" }

        if(user.role !== "ADMIN") {
            res.status(403).json({message: "Unauthorized"})
            return
        }
        res.status(200).json({ username: user.username, role: user.role })
    }

    static async getCategoryItems(req: Request, res: Response) {
        try {
            const param = req.params.category as CategoryParam;
            console.log("Received category parameter:", param);
            if (!param) {
                res.status(400).json({ message: "Category parameter is required" });
                return
            }
            let cards = await CardsModel.find<CardsType>({ category: param }).sort({ is_premium: -1 }).exec();

            if (cards.length === 0) {
                res.status(404).json({ message: "No cards found for the specified category" });
                return
            }

            const PUBLIC_BASE_URL = process.env.BLOB_BASE_URL || "http://localhost:9000/albay-tourist"

            for (const item of cards) {
                if (item.cover_image) {
                    item.cover_image = `${PUBLIC_BASE_URL}/${item.cover_image}`;
                }
            }

            res.status(200).json(cards);

        } catch (error) {
            console.error("Error processing file upload:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getBySlug(req: Request, res: Response) {
        type ParamType = {
            resource: "spots" | "restaurants" | "hotels";
            slug: string
        }
        try {
            const param = req.params as ParamType
            const resource = param.resource
            const slug = param.slug

            console.log("Received slug parameter:", slug);

            if (!slug || !resource) {
                res.status(400).json({ message: "Slug and Resource parameter is required" });
                return
            }

            let place: TouristSpotType | RestaurantType | HotelType | null = null

            switch (resource) {
                case "spots":
                    place = await TouristSpot.findOne<TouristSpotType>({ slug }).exec()
                    break;
                case "restaurants":
                    place = await Restaurants.findOne<RestaurantType>({ slug }).exec()
                    break;
                case "hotels":
                    place = await Hotels.findOne<HotelType>({ slug }).exec()
                    break;
                default:
                    place = await TouristSpot.findOne<TouristSpotType>({ slug }).exec()
                    break;
            }

            if (!place) {
                res.status(404).json({ message: "No place found for the specified slug" });
                return
            }

            const PUBLIC_BASE_URL = process.env.BLOB_BASE_URL || "http://localhost:9000/albay-tourist"

            if (place.cover_image) {
                place.cover_image = `${PUBLIC_BASE_URL}/${place.cover_image}`;
            }

            res.status(200).json(place);
        } catch (error) {
            console.error("Error processing file upload:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const { item } = req.body as { item: string }
            const file = req.file
            if (!file) return res.status(400).json({ message: "File required" })

            const jsonItem = JSON.parse(item) as TouristSpotType

            const timestamp = Date.now()
            const basePath = `albay/${jsonItem.category[0]}`
            const originalKey = `${basePath}/${timestamp}_${file.originalname}`
            const processedKey = `${basePath}/cards/${timestamp}_${file.originalname}`

            const processedImage = await sharp(file.buffer)
                .resize({ height: 500, withoutEnlargement: true })
                .jpeg({ quality: 60 })
                .toBuffer()

            await Promise.all([
                blob.write(originalKey, file.buffer, {
                    type: file.mimetype,
                    retry: 5
                }),
                blob.write(processedKey, processedImage, {
                    type: "image/jpeg",
                    retry: 5
                })
            ])


            const placeData: TouristSpotType | RestaurantType | HotelType = {
                slug: jsonItem.slug,
                title: jsonItem.title,
                cover_image: originalKey,
                description: jsonItem.description,
                category: jsonItem.category,
                municipality: jsonItem.municipality,
                geo_lat: jsonItem.geo_lat,
                geo_lng: jsonItem.geo_lng,
                activity_tags: jsonItem.activity_tags,
                contact_info: jsonItem.contact_info,
                social_links: jsonItem.social_links,
                pricing_lowest: jsonItem.pricing_lowest,
                operating_hours: jsonItem.operating_hours,
                rating: jsonItem.rating,
                is_premium: jsonItem.is_premium,
                view_count: jsonItem.view_count,
                fullURLMap: jsonItem.fullURLMap,
                fileSizeMB: Math.round(((file.size ?? 0) / (1024 * 1024)) * 10000) / 10000
            }

            const newCards: CardsType = {
                slug: jsonItem.slug,
                title: jsonItem.title,
                cover_image: processedKey,
                description: jsonItem.description,
                category: jsonItem.category,
                municipality: jsonItem.municipality,
                pricing_lowest: jsonItem.pricing_lowest ?? 0,
                is_premium: jsonItem.is_premium,
                fileSizeMB: Math.round((processedImage.length / (1024 * 1024)) * 10000) / 10000
            }

            let placePromise: Promise<any>;

            switch (placeData.category[0]) {
                case "spots":
                    placePromise = TouristSpot.insertOne(placeData);
                    break;
                case "restaurants":
                    placePromise = Restaurants.insertOne(placeData);
                    break;
                case "hotels":
                    placePromise = Hotels.insertOne(placeData);
                    break;
                default:
                    throw new Error("Invalid category");
            }

            const [newPlace, newCard] = await Promise.all([
                placePromise,
                CardsModel.insertOne(newCards)
            ]);

            if (!newPlace || !newCard) {
                return res.status(400).json({ error: "Failed to save photo record" })
            }

            const PUBLIC_BASE_URL = process.env.BLOB_BASE_URL || "http://localhost:9000/albay-tourist"

            if (newPlace.cover_image) {
                newPlace.cover_image = `${PUBLIC_BASE_URL}/${newPlace.cover_image}`;
            }
            return res.status(201).json(newPlace)

        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Server error" })
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const slug = req.params.slug as string
            const { item } = req.body as { item: string }
            const file = req.file

            if (!slug) {
                return res.status(400).json({ message: "Slug parameter is required" })
            }

            const existingSpot = await TouristSpot.findOne({ slug }).exec()
            if (!existingSpot) {
                return res.status(404).json({ message: "No place found for the specified slug" })
            }

            const jsonItem = JSON.parse(item) as TouristSpotType

            const PUBLIC_BASE_URL = process.env.BLOB_BASE_URL || "http://localhost:9000/albay-tourist"

            let originalUrl = existingSpot.cover_image
            let processedUrl: string | undefined

            if (file) {
                const timestamp = Date.now()
                const basePath = `albay/${jsonItem.category[0]}`
                const originalKey = `${basePath}/${timestamp}_${file.originalname}`
                const processedKey = `${basePath}/cards/${timestamp}_${file.originalname}`

                const processedImage = await sharp(file.buffer)
                    .resize({ height: 500, withoutEnlargement: true })
                    .jpeg({ quality: 60 })
                    .toBuffer()

                await Promise.all([
                    blob.write(originalKey, file.buffer, {
                        type: file.mimetype,
                        retry: 5
                    }),
                    blob.write(processedKey, processedImage, {
                        type: "image/jpeg",
                        retry: 5
                    })
                ])

                originalUrl = `${PUBLIC_BASE_URL}/${originalKey}`
                processedUrl = `${PUBLIC_BASE_URL}/${processedKey}`

                jsonItem.fileSizeMB =
                    Math.round(((file.size ?? 0) / (1024 * 1024)) * 10000) / 10000
            }

            const updatedSpot = await TouristSpot.findOneAndUpdate(
                { slug },
                {
                    ...jsonItem,
                    cover_image: originalUrl
                },
                { returnDocument: "after" }
            ).exec()

            if (processedUrl) {
                await CardsModel.findOneAndUpdate(
                    { slug },
                    {
                        title: jsonItem.title,
                        cover_image: processedUrl,
                        description: jsonItem.description,
                        category: jsonItem.category,
                        municipality: jsonItem.municipality,
                        pricing_lowest: jsonItem.pricing_lowest ?? 0,
                        is_premium: jsonItem.is_premium,
                        fileSizeMB: jsonItem.fileSizeMB
                    }
                ).exec()
            } else {
                await CardsModel.findOneAndUpdate(
                    { slug },
                    {
                        title: jsonItem.title,
                        description: jsonItem.description,
                        category: jsonItem.category,
                        municipality: jsonItem.municipality,
                        pricing_lowest: jsonItem.pricing_lowest ?? 0,
                        is_premium: jsonItem.is_premium
                    }
                ).exec()
            }

            if (!updatedSpot) {
                return res.status(400).json({ message: "Failed to update record" })
            }

            return res.status(200).json(updatedSpot)

        } catch (error) {
            console.error(error)
            return res.status(500).json({ message: "Server error" })
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { slug } = req.params as { slug: string }

            if (!slug) {
                return res.status(400).json({ message: "Slug parameter is required" })
            }

            const existingSpot = await TouristSpot.findOne({ slug }).exec()
            if (!existingSpot) {
                return res.status(404).json({ message: "No place found for the specified slug" })
            }

            const existingCard = await CardsModel.findOne({ slug }).exec()

            const deleteOperations: Promise<any>[] = [
                TouristSpot.deleteOne({ slug }).exec(),
                CardsModel.deleteOne({ slug }).exec()
            ]

            if (existingSpot.cover_image) {
                deleteOperations.push(blob.delete(existingSpot.cover_image))
            }

            if (existingCard?.cover_image) {
                deleteOperations.push(blob.delete(existingCard.cover_image))
            }

            await Promise.all(deleteOperations)

            return res.status(200).json({ message: "Record deleted successfully" })

        } catch (error) {
            console.error(error)
            return res.status(500).json({ message: "Server error" })
        }
    }

    static async init(req: Request, res: Response) {
        try {

            const [
                spotsCount,
                restaurantsCount,
                hotelsCount,
                touristGuideCount,
                terminalsCount
            ] = await Promise.all([
                TouristSpot.countDocuments(),
                Restaurants.countDocuments(),
                Hotels.countDocuments(),
                TouristGuide.countDocuments(),
                Terminals.countDocuments()
            ])

            console.log(spotsCount,
                restaurantsCount,
                hotelsCount,
                touristGuideCount,
                terminalsCount);



            res.status(200).json({
                categoryItemCount: { spotsCount, restaurantsCount, hotelsCount, touristGuideCount, terminalsCount }

            })
        } catch (error) {

        }
    }
}