import mongoose from "mongoose";

type ConexaoCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Singleton: a conexão fica guardada no "global" para ser reaproveitada.
// Sem isso, o hot reload do Next abriria uma conexão nova a cada alteração no código.
const globalComCache = globalThis as typeof globalThis & { mongooseCache?: ConexaoCache };
const cache: ConexaoCache = globalComCache.mongooseCache ?? { conn: null, promise: null };
globalComCache.mongooseCache = cache;

export async function dbConnect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Defina MONGODB_URI no arquivo .env.local");
  }

  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, { bufferCommands: false });
  }

  try {
    cache.conn = await cache.promise;
  } catch (erro) {
    cache.promise = null; // permite tentar de novo na próxima chamada
    throw erro;
  }

  return cache.conn;
}
