import dotenv from 'dotenv';

dotenv.config();

if(!process.env.MONGODB_URI){
    throw new Error("MONGODB_URI is required in environmental variable.")
}

if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is required in environmental variable.")
}



const config={
    MONGO_URI:process.env.MONGODB_URI,
    JWT_SECRET:process.env.JWT_SECRET,
}
export default config;
