"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const ReadingPlan_1 = __importDefault(require("../models/ReadingPlan"));
const User_1 = __importDefault(require("../models/User"));
dotenv_1.default.config();
const plans = [
    {
        title: 'New Testament Foundations',
        description: 'Read the core books of the New Testament over 30 days to build a strong foundation of Christian faith and teaching.',
        type: 'book',
        duration: 30,
        coverImage: 'https://images.unsplash.com/photo-1504051771394-dd2e66b2e08f?w=600&auto=format&fit=crop&q=60',
        isPublic: true,
        readings: [
            { day: 1, title: 'The Birth of Jesus', book: 'Matthew', chapters: '1-2', description: 'Read about the genealogy and birth of Jesus.' },
            { day: 2, title: 'The Sermon on the Mount', book: 'Matthew', chapters: '5-7', description: 'Jesus teaches the beatitudes and the Lord\'s prayer.' },
            { day: 3, title: 'Parables of the Kingdom', book: 'Matthew', chapters: '13', description: 'Understand the Kingdom through parables of the sower and mustard seed.' },
            { day: 4, title: 'The Great Commission', book: 'Matthew', chapters: '28', description: 'Jesus resurrects and commands his disciples to go into all nations.' },
            { day: 5, title: 'The Baptism & Temptation', book: 'Mark', chapters: '1', description: 'John baptizes Jesus, and Jesus begins his ministry.' },
            { day: 6, title: 'Authority Over Storms', book: 'Mark', chapters: '4-5', description: 'Jesus calms the storm and heals a demon-possessed man.' },
            { day: 7, title: 'The Transfiguration', book: 'Mark', chapters: '9', description: 'Jesus is transfigured on the mountain.' },
            { day: 8, title: 'The Crucifixion', book: 'Mark', chapters: '15', description: 'The trial, suffering, and crucifixion of Christ.' },
            { day: 9, title: 'The Good Samaritan', book: 'Luke', chapters: '10', description: 'Learn who your neighbor is.' },
            { day: 10, title: 'The Prodigal Son', book: 'Luke', chapters: '15', description: 'A beautiful parable showing God\'s grace and welcoming heart.' },
            { day: 11, title: 'The Word Became Flesh', book: 'John', chapters: '1', description: 'In the beginning was the Word...' },
            { day: 12, title: 'Nicodemus & The Samaritan Woman', book: 'John', chapters: '3-4', description: 'Learn about being born again and the living water.' },
            { day: 13, title: 'The Good Shepherd', book: 'John', chapters: '10', description: 'Jesus is the gate and the Shepherd who lays down his life.' },
            { day: 14, title: 'The Resurrection of Lazarus', book: 'John', chapters: '11', description: 'Jesus declares, "I am the resurrection and the life."' },
            { day: 15, title: 'The Promise of the Holy Spirit', book: 'John', chapters: '14-16', description: 'Jesus promises the Helper.' },
            { day: 16, title: 'Holy Spirit Comes', book: 'Acts', chapters: '2', description: 'The day of Pentecost and the birth of the Church.' },
            { day: 17, title: 'Saul\'s Conversion', book: 'Acts', chapters: '9', description: 'Saul meets Jesus on the road to Damascus.' },
            { day: 18, title: 'Justification by Faith', book: 'Romans', chapters: '3-5', description: 'Paul explains how we are made right with God.' },
            { day: 19, title: 'Life in the Spirit', book: 'Romans', chapters: '8', description: 'There is now no condemnation for those in Christ Jesus.' },
            { day: 20, title: 'Love is Patient', book: '1 Corinthians', chapters: '13', description: 'The famous chapter defining love.' },
            { day: 21, title: 'New Creation in Christ', book: '2 Corinthians', chapters: '5', description: 'We are ambassadors for Christ.' },
            { day: 22, title: 'Fruit of the Spirit', book: 'Galatians', chapters: '5', description: 'Walk by the Spirit.' },
            { day: 23, title: 'Armor of God', book: 'Ephesians', chapters: '6', description: 'Stand firm with spiritual armor.' },
            { day: 24, title: 'Imitating Christ\'s Humility', book: 'Philippians', chapters: '2', description: 'Have the same attitude as Christ.' },
            { day: 25, title: 'The Model of Faith', book: 'Hebrews', chapters: '11', description: 'The hall of faith.' },
            { day: 26, title: 'Faith and Deeds', book: 'James', chapters: '1-2', description: 'Faith without works is dead.' },
            { day: 27, title: 'Walking in the Light', book: '1 John', chapters: '1-2', description: 'God is light and in Him is no darkness.' },
            { day: 28, title: 'Letters to the Churches', book: 'Revelation', chapters: '2-3', description: 'Messages to the seven churches.' },
            { day: 29, title: 'The Throne in Heaven', book: 'Revelation', chapters: '4-5', description: 'Worship of the Lamb who was slain.' },
            { day: 30, title: 'New Heaven & New Earth', book: 'Revelation', chapters: '21-22', description: 'Eden restored and the return of Christ.' }
        ]
    },
    {
        title: 'Daily Wisdom: 7 Days of Proverbs',
        description: 'An introductory 7-day topical study focused on developing wisdom, speech control, and proper relationships.',
        type: 'topical',
        duration: 7,
        coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=60',
        isPublic: true,
        readings: [
            { day: 1, title: 'The Value of Wisdom', book: 'Proverbs', chapters: '1', description: 'The fear of the Lord is the beginning of knowledge.' },
            { day: 2, title: 'Trust in the Lord', book: 'Proverbs', chapters: '3', description: 'Trust in the Lord with all your heart.' },
            { day: 3, title: 'Keep Your Heart', book: 'Proverbs', chapters: '4', description: 'Above all else, guard your heart, for everything you do flows from it.' },
            { day: 4, title: 'Warnings Against Laziness', book: 'Proverbs', chapters: '6', description: 'Go to the ant, you sluggard; consider its ways and be wise!' },
            { day: 5, title: 'The Words We Speak', book: 'Proverbs', chapters: '12', description: 'Truthful lips endure forever, but a lying tongue lasts only a moment.' },
            { day: 6, title: 'Humility and Pride', book: 'Proverbs', chapters: '16', description: 'Pride goes before destruction, a haughty spirit before a fall.' },
            { day: 7, title: 'The Virtuous Woman / Conclusion', book: 'Proverbs', chapters: '31', description: 'Charm is deceptive, and beauty is fleeting; but a woman who fears the Lord is to be praised.' }
        ]
    }
];
const seedDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MONGODB_URI is not defined');
        }
        await mongoose_1.default.connect(mongoURI);
        console.log('Connected to MongoDB for seeding...');
        await ReadingPlan_1.default.deleteMany({ createdBy: null }); // Only delete default public seeds
        console.log('Cleared existing default public plans.');
        await ReadingPlan_1.default.insertMany(plans);
        console.log('Seeded database with default plans successfully! 🌱');
        // Seed admin & member users
        await User_1.default.deleteMany({ email: { $in: ['admin@casacuvantului.ro', 'member@casacuvantului.ro'] } });
        console.log('Cleared existing default seed users.');
        const adminUser = new User_1.default({
            name: 'Admin User',
            email: 'admin@casacuvantului.ro',
            password: 'admin12345',
            role: 'admin',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin'
        });
        const memberUser = new User_1.default({
            name: 'Member User',
            email: 'member@casacuvantului.ro',
            password: 'member12345',
            role: 'member',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=member'
        });
        await adminUser.save();
        await memberUser.save();
        console.log('Seeded default seed users (admin & member) successfully! 👥');
        process.exit(0);
    }
    catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};
seedDB();
//# sourceMappingURL=plans.js.map