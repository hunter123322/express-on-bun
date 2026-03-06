import type { Request, Response } from "express";
import type { CardsType, HotelType, RestaurantType, TerminalType, TouristGuideType, TouristSpotType } from "../../types/types";
import { blob } from "../../utils/minio";
import { TouristSpot } from "../../models/spots.model";
import sharp from "sharp";
import { CardsModel } from "../../models/cards.model";
import { Restaurants } from "../../models/restaurants.model";
import { Hotels } from "../../models/hotels.model";
import { TouristGuide } from "../../models/tourguides.model";
import { Terminals } from "../../models/terminals.model";

export class HomeController {
    static async init(req: Request, res: Response) {
        try {
            const category = req.params.category as string

            const touristSpots = await TouristSpot.find<TouristSpotType>()
                .sort({ createdAt: -1 })
                .limit(10)

            const PUBLIC_BASE_URL = process.env.BLOB_BASE_URL || "http://localhost:9000/albay-tourist"

            for (const spots of touristSpots) {
                if (spots.cover_image) {
                    spots.cover_image = `${PUBLIC_BASE_URL}/${spots.cover_image}`;
                }
            }
            console.log(touristSpots);
            res.status(200).json(touristSpots)
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Server error" })
        }
    }

    static async list(req: Request, res: Response) {
        try {
            const slug = req.params.place as string
            const category = req.params.category as string

            let place: TouristGuideType | RestaurantType | HotelType | TouristGuideType | TerminalType | null = null

            switch (category) {
                case "spots":
                    place = await TouristSpot.findOne<TouristSpotType>({ slug: slug })
                    break;
                case "tourist-spots":
                    place = await TouristSpot.findOne<TouristSpotType>({ slug: slug })
                    break;
                case "restaurants":
                    place = await Restaurants.findOne<RestaurantType>({ slug: slug })
                    break;
                case "hotels":
                    place = await Hotels.findOne<HotelType>({ slug: slug })
                    break;
                case "tour-guides":
                    // place = await TouristGuide.findOne<TouristGuideType>({ slug: slug })
                    break;
                case "terminals":
                    // place = await Terminals.findOne<TerminalType>({ slug: slug })
                    break;
                default:
                    throw new Error("Invalid category");
            }

            if (!place) {
                res.status(404).render('error', {
                    message: "No tourist spots found for this category",
                    error: {}
                });
                return;
            }

            const PUBLIC_BASE_URL = process.env.BLOB_BASE_URL || "http://localhost:9000/albay-tourist"

            if (place.cover_image) {
                place.cover_image = `${PUBLIC_BASE_URL}/${place.cover_image}`;
            }

            // Set content type to HTML
            res.setHeader('Content-Type', 'text/html');

            switch (place.category[0]) {
                case "spots":
                    res.status(200).render('tourist-spots-list', {
                        listing: place,
                        title: 'Tourist Spots in Albay'
                    });
                    break;

                case "restaurants":
                    res.status(200).render('restaurant', {
                        listing: place,
                        title: 'Restaurants in Albay'
                    });
                    break;

                case "terminals":
                    res.status(200).render('terminal', {
                        listing: place,
                        title: 'Terminals in Albay'
                    });
                    break;
                case "hotels":
                    res.status(200).render('hotel', {
                        listing: place,
                        title: 'Hotels in Albay'
                    });
                    break;
                default:
                    res.status(200).render('tourist-spots-list', {
                        listing: place,
                        title: 'Tourist Spots in Albay'
                    });
                    break;
            }

        } catch (error) {
            console.log(error);
            res.status(500).render('error', {
                message: "Server error",
                error: error
            });
        }
    }

    static async new(req: Request, res: Response) {
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

            const newTouristSpot: TouristSpotType = {
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

            const [newSpot, newCard] = await Promise.all([
                TouristSpot.insertOne(newTouristSpot),
                CardsModel.insertOne(newCards)
            ])

            if (!newSpot || !newCard) {
                return res.status(400).json({ error: "Failed to save photo record" })
            }

            const imageUrl = blob.presign(originalKey, {
                method: "GET",
                expiresIn: 60 * 60
            })

            return res.status(201).json({
                ...newTouristSpot,
                cover_image: imageUrl
            })

        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Server error" })
        }
    }

    static async initItem(req: Request, res: Response) {
        try {
            const place = req.params.place as string
            const isPremium = req.query.is_premium === 'true'

            console.log("called", place);

            if (!place) {
                res.status(400).json({ message: "Place query parameter is required" });
                return;
            }

            const items = await CardsModel.find<CardsType>({ category: place, is_premium: isPremium })
                .sort({ createdAt: -1 })
                .limit(10)

            const PUBLIC_BASE_URL = process.env.BLOB_BASE_URL || "http://localhost:9000/albay-tourist"

            for (const item of items) {
                if (item.cover_image) {
                    item.cover_image = `${PUBLIC_BASE_URL}/${item.cover_image}`;
                }
            }
            if (isPremium) {
                res.status(200).render('premiumList', {
                    listings: items,
                    title: 'Tourist Spots in Albay'
                });
            } else {
                res.status(200).render('listItem', {
                    listings: items,
                    title: 'Tourist Spots in Albay'
                });
            }

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Server error" });
        }
    }
}